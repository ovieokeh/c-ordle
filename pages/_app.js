import Head from "next/head";
import { useState } from "react";
import "../styles/globals.css";
import getStyles from "../utils/getStyles";
import { useIsomorphicLayoutEffect } from "../utils/hooks";
import { initialiseApp } from "../utils/pusher";

function MyApp({ Component, pageProps }) {
  const [username, setUsername] = useState("");
  const [currentUser, setUser] = useState(null);
  const [api, setApi] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [globalRoom, setGlobalRoom] = useState(null);

  const fetchAllRooms = async () => {
    const allRoomsResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/all-rooms`
    );
    const allRooms = await allRoomsResponse.json();
    setRooms(allRooms);
  };

  useIsomorphicLayoutEffect(() => {
    if (currentUser) {
      fetchAllRooms();
    }
  }, [currentUser]);

  useIsomorphicLayoutEffect(() => {
    if (typeof window !== "undefined") {
      let currentUser = window.sessionStorage.getItem("current_user");
      if (currentUser) {
        const parsed = JSON.parse(currentUser);
        setUser(parsed);
        handleSignIn(parsed.id, parsed.username);
      }
    }
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (currentUser) {
      const pusher = initialiseApp(currentUser.id, currentUser.username);
      pusher.connection.bind("state_change", function (states) {});

      const mainRoom = pusher.subscribe("presence-client-global");

      mainRoom.bind("pusher:member_added", () => {
        fetchAllRooms();
      });

      mainRoom.bind("client-global-event", () => {
        fetchAllRooms();
      });

      setApi(pusher);
      setGlobalRoom(mainRoom);
    }
  }, [currentUser]);

  const handleSignIn = async (id, user_name) => {
    const userResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/sign-in`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          username: user_name || username,
        }),
      }
    );
    const user = await userResponse.json();
    setUser(user);
    window.sessionStorage.setItem("current_user", JSON.stringify(user));
  };

  return (
    <div className="">
      <Head>
        <title>Competitive Wordle</title>
        <meta
          name="description"
          content="A proof of concept for Ovie to learn more about Channels"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main
        className={`p-6 items-center justify-center ${getStyles("center")}`}
      >
        <h1 className="text-3xl mb-16 text-center">Competitive Wordle</h1>

        {!currentUser ? (
          <form
            className="flex flex-col justify-center center max-w-[600px] mx-auto"
            onSubmit={(e) => {
              e.preventDefault();
              handleSignIn();
            }}
          >
            <p className="mb-4">Choose a username to start playing</p>
            <input
              type="text"
              placeholder="Your game name"
              className="block border py-2  px-4 rounded-sm"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <button
              className="py-2 px-4 mt-2 rounded hover:bg-slate-900 bg-slate-600 text-white"
              type="submit"
            >
              Sign in
            </button>
          </form>
        ) : api ? (
          <Component
            {...pageProps}
            currentUser={currentUser}
            api={api}
            rooms={rooms}
            globalRoom={globalRoom}
          />
        ) : null}
      </main>
    </div>
  );
}

export default MyApp;
