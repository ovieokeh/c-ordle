import { useCallback, useEffect, useState } from "react";
import { useIsomorphicLayoutEffect } from "../../utils/hooks";
import GameEvents from "../../components/GameEvents";
import Grid from "../../components/Grid";

const ANSWER = "GREEN";
const MEMBER_COUNT_REQUIREMENT = 3;
export default function Room({ currentUser, api, setApi, globalRoom }) {
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [gameState, setGameState] = useState("waiting");
  const [guesses, setGuesses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [winner, setWinner] = useState(null);
  const [gameStartInterval, setGameStartInterval] = useState(5);
  const [redirectInterval, setRedirectInterval] = useState(5);

  useEffect(() => {
    let interval;

    if (gameState === "ended") {
      interval = setInterval(() => {
        if (redirectInterval === 0) {
          window.location.href = "/";
          return;
        }

        setRedirectInterval((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [gameState, redirectInterval]);

  useEffect(() => {
    let interval;

    if (gameState === "starting") {
      interval = setInterval(() => {
        if (gameStartInterval === 0) {
          room.trigger("client-game-start", {});
          return;
        }

        setGameStartInterval((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [gameState, gameStartInterval, room]);

  useIsomorphicLayoutEffect(() => {
    if (currentUser) {
      let channelName = window?.location.pathname;
      channelName = channelName.slice(channelName.lastIndexOf("/") + 1);
      const subscription = api.subscribe(channelName);

      subscription.bind("pusher:subscription_succeeded", (data) => {
        const players = Object.entries(data.members).map((entry) => ({
          id: entry[0],
          info: entry[1],
        }));
        if (players.length === MEMBER_COUNT_REQUIREMENT) {
          subscription.trigger("client-room-complete", {});
        }
        setPlayers(players);
      });

      subscription.bind("pusher:member_added", (data) => {
        setPlayers((prev) => {
          const existingPlayer = prev.find((p) => p.id === data.id);
          if (existingPlayer) return prev;

          const newPlayers = [...prev, data];
          if (newPlayers.length === MEMBER_COUNT_REQUIREMENT) {
            subscription.trigger("client-room-complete", {});
          }
          globalRoom.trigger("client-global-event", {});
          return newPlayers;
        });
      });

      subscription.bind("pusher:member_removed", (data) => {
        setPlayers((prev) => {
          const newPlayers = [...prev];
          const indexOfPlayer = newPlayers.findIndex((pl) => pl.id === data.id);
          if (indexOfPlayer > -1) newPlayers.splice(indexOfPlayer, 1);
          return newPlayers;
        });
        globalRoom.trigger("client-global-event", {});
      });

      subscription.bind("client-room-complete", () => {
        setGameState("starting");
      });

      subscription.bind("client-game-start", () => {
        setGameState("running");
      });

      subscription.bind("client-guess", (guess) => {
        if (guess.guess === ANSWER) {
          setGameState("ended");
          setIsModalOpen(true);
          setWinner(guess.currentUser);
        }

        setGuesses((prev) => [...prev, guess]);
      });

      setRoom(subscription);
    }

    return () => {
      globalRoom?.trigger("client-global-event", {});
    };
  }, [currentUser, globalRoom, api]);

  useEffect(() => {
    if (room && gameState === "ended") {
      room.disconnect();
    }
  }, [gameState, room]);

  const handleSubmitGuess = useCallback(
    (guess, cellState) => {
      room.trigger("client-guess", {
        guess,
        cellState,
        currentUser,
      });

      room.emit("client-guess", {
        guess,
        cellState,
        currentUser,
      });

      if (guess === ANSWER) {
        setGameState("ended");
        setIsModalOpen(true);
        setWinner(currentUser);
      }
    },
    [room, currentUser]
  );

  if (!room) return null;

  const ALPHABET = "qwertyuiopasdfghjklzxcvbnm";
  const ownGuesses = guesses.filter((g) => g.currentUser.id === currentUser.id);
  const letterState = ownGuesses
    .map((g) => g.cellState)
    .flat()
    .reduce((acc, cur) => {
      acc[cur.letter] = acc[cur.letter] === "valid" ? "valid" : cur.state;
      return acc;
    }, {});

  return (
    <div className="max-w-[600px] w-full mx-auto">
      <div>
        <button
          className="mb-4"
          onClick={async () => {
            await globalRoom.trigger("client-global-event", {});
            window.location.href = "/";
          }}
        >
          {"< "}Back ({currentUser.username})
        </button>

        <div className="mb-4 max-w-[275px]">
          {ALPHABET.split("").map((letter) => {
            const state = letterState[letter.toUpperCase()];

            return (
              <span
                key={letter}
                className={`inline-flex items-center justify-center w-5 h-5 mx-1 ${
                  state === "valid"
                    ? "bg-green-600 text-white"
                    : state === "misplaced"
                    ? "bg-orange-500 text-white"
                    : state === "invalid"
                    ? "bg-gray-500 text-white opacity-50"
                    : ""
                }`}
              >
                {letter.toUpperCase()}
              </span>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-16 sm:flex-row ">
        <Grid
          answer={ANSWER}
          gameState={gameState}
          gameStartInterval={gameStartInterval}
          setGameState={setGameState}
          handleSubmitGuess={handleSubmitGuess}
        />

        <div>
          <ul>
            <p className="text-sm opacity-75 text-slate-500">Players in game</p>
            {Object.values(players).map(({ id, info }) => (
              <li key={id}>{info.username}</li>
            ))}
          </ul>

          <GameEvents
            currentUser={currentUser}
            server={room}
            guesses={guesses}
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            winner={winner}
            redirectInterval={redirectInterval}
          />
        </div>
      </div>
    </div>
  );
}
