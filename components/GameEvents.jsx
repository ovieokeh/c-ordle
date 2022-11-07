import GameModal from "./Modal";

export default function GameEvents({
  currentUser,
  guesses,
  isModalOpen,
  setIsModalOpen,
  winner,
  redirectInterval,
}) {
  return (
    <div className="mt-16">
      <h3 className="text-sm opacity-75 text-slate-500">Activity</h3>
      <ul className="text-sm opacity-75 text-indigo-500" id="game-events">
        {guesses.map(({ currentUser, guess, cellState }) => (
          <li key={currentUser.id + guess}>
            {currentUser.username} played{" "}
            <span>
              {cellState.map((cell, idx) => (
                <span
                  key={idx}
                  className={`${
                    cell.state === "valid"
                      ? " text-green-600"
                      : cell.state === "misplaced"
                      ? "text-orange-500"
                      : "text-black dark:text-white"
                  }`}
                >
                  {cell.letter}
                </span>
              ))}
            </span>
          </li>
        ))}
      </ul>

      <GameModal
        isOpen={isModalOpen}
        closeModal={() => {
          setIsModalOpen(false);
        }}
        isWinner={isModalOpen && currentUser.id === winner.id}
        winner={winner}
        setIsOpen={setIsModalOpen}
        redirectInterval={redirectInterval}
      />
    </div>
  );
}
