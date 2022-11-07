/* eslint-disable @next/next/no-html-link-for-pages */
import Link from "next/link";
import Modal from "react-modal";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

export default function GameModal({
  isOpen,
  closeModal,
  isWinner,
  winner,
  redirectInterval,
}) {
  return (
    <Modal isOpen={isOpen} style={customStyles} contentLabel="Game Modal">
      <div className="flex flex-col items-center justify-center">
        <h2 className="text-center text-lg mb-4 text-orange-800">Game over</h2>
        {isWinner ? (
          <p className="text-lime-600">Congratulations, you won this round</p>
        ) : (
          <p className="text-neutral-600">{winner?.username} won this round</p>
        )}
        <div className="flex gap-6 mt-4">
          <a className="text-sky-800" href="/">
            Back to lobby ({redirectInterval})
          </a>
          <button className="text-red-600" onClick={() => closeModal()}>
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
