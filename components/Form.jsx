import { useState } from "react";

export default function Form({ handleSubmit }) {
  const [input, setInput] = useState("");
  return (
    <form
      className=""
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(input);
        setInput("");
      }}
    >
      <input
        className="block border p-2 rounded-sm"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button
        className="py-2 px-4 mt-4 rounded hover:bg-slate-900 bg-slate-600 text-white"
        type="submit"
      >
        Send to test5
      </button>
    </form>
  );
}
