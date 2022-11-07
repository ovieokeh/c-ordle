import { useCallback, useEffect, useState } from "react";

const createGrid = ({ numRows, numColumns }) => {
  const grid = [];

  for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
    const row = [];
    for (let columnIndex = 0; columnIndex < numColumns; columnIndex++) {
      row.push(columnIndex);
    }
    grid.push(row);
  }

  return grid;
};

const numRows = 6;
const numColumns = 5;
const grid = createGrid({ numRows, numColumns });

const CELL_STATES = {
  initial: "initial",
  invalid: "invalid",
  misplaced: "misplaced",
  valid: "valid",
};

export default function Grid({
  answer = "PLAIN",
  gameState,
  handleSubmitGuess,
  gameStartInterval,
}) {
  const [gridState, setGridState] = useState({
    currentRow: 0,
    currentColumn: 0,
  });
  const [cellState, setCellState] = useState({});

  const getCurrentGuess = useCallback(() => {
    const rowCells = [];

    for (let rowIndex = gridState.currentRow; rowIndex < numRows; rowIndex++) {
      for (let columnIndex = 0; columnIndex < numColumns; columnIndex++) {
        rowCells.push(`${rowIndex}, ${columnIndex}`);
      }
    }
    const currentGuess = rowCells
      .map((cell) => cellState[cell]?.letter)
      .join("");

    return currentGuess;
  }, [cellState, gridState.currentRow]);

  const checkBoard = useCallback(() => {
    const currentGuess = getCurrentGuess();
    const guessState = [];
    for (const letterIdx in currentGuess) {
      const letter = currentGuess[letterIdx];
      const isCellMisplaced =
        answer.includes(letter) && answer[letterIdx] !== letter;
      const isCellCorrect =
        answer.includes(letter) && answer[letterIdx] === letter;
      const isCellInvalid = !answer.includes(letter);

      guessState.push({
        letter,
        state: isCellInvalid
          ? CELL_STATES.invalid
          : isCellMisplaced
          ? CELL_STATES.misplaced
          : isCellCorrect
          ? CELL_STATES.valid
          : CELL_STATES.initial,
      });
    }
    const newCellState = {};

    for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
      for (let columnIndex = 0; columnIndex < numColumns; columnIndex++) {
        const pos = `${rowIndex}, ${columnIndex}`;
        const valueAtPos = cellState[pos];

        if (!valueAtPos) continue;

        const isCellMisplaced =
          answer.includes(valueAtPos.letter) &&
          answer[columnIndex] !== valueAtPos.letter;
        const isCellCorrect =
          answer.includes(valueAtPos.letter) &&
          answer[columnIndex] === valueAtPos.letter;
        const isCellInvalid = !answer.includes(valueAtPos.letter);

        newCellState[pos] = {
          ...valueAtPos,
          state: isCellInvalid
            ? CELL_STATES.invalid
            : isCellMisplaced
            ? CELL_STATES.misplaced
            : isCellCorrect
            ? CELL_STATES.valid
            : CELL_STATES.initial,
        };
      }
    }

    setCellState(newCellState);
    handleSubmitGuess(currentGuess, Object.values(guessState));
  }, [answer, cellState, getCurrentGuess, handleSubmitGuess]);

  useEffect(() => {
    const handleKeypress = (event) => {
      if (["waiting", "starting", "ended"].includes(gameState)) return;

      const keyPressed = String.fromCharCode(event.keyCode);
      const { currentRow, currentColumn } = gridState;
      const currentCell = `${currentRow}, ${currentColumn}`;

      if (event.key === "Backspace") {
        if (currentColumn === 0)
          return console.info("Can't delete any further");

        setCellState((prev) => ({
          ...prev,
          [currentCell]: { state: CELL_STATES.initial, letter: "" },
        }));

        // If cell already empty, move left
        if (!cellState[currentCell]?.letter)
          setGridState((prev) => ({
            ...prev,
            currentColumn: prev.currentColumn - 1,
          }));

        return;
      }

      if (event.key === "Enter") {
        if (currentColumn !== numColumns - 1)
          return console.info("Not enough letters");

        checkBoard();

        return setGridState((prev) => {
          return {
            currentRow: prev.currentRow + 1,
            currentColumn: 0,
          };
        });
      }

      if (!keyPressed.match(/[a-z]/i))
        return console.info("Only letters are allowed");

      setCellState((prev) => ({
        ...prev,
        [currentCell]: {
          state: CELL_STATES.initial,
          letter: keyPressed.toUpperCase(),
        },
      }));

      if (currentColumn + 1 < numColumns)
        setGridState((prev) => ({
          ...prev,
          currentColumn: prev.currentColumn + 1,
        }));
    };

    document.addEventListener("keyup", handleKeypress);

    return () => {
      document.removeEventListener("keyup", handleKeypress);
    };
  }, [gameState, gridState, cellState, answer, checkBoard]);

  return (
    <div>
      {gameState === "waiting" && <p>Waiting for at least 3 players</p>}
      {gameState === "starting" && <p>Game starts in {gameStartInterval}</p>}

      <div
        className={`grid relative ${
          gameState !== "running" ? "cursor-not-allowed" : ""
        } gap-1 p-2 grid-rows-${numRows} grid-cols-${numColumns}`}
      >
        {grid.map((row, rowIndex) => {
          return (
            <div key={rowIndex} className="flex gap-1">
              {row.map((cell, cellIndex) => {
                const cellPos = `${rowIndex}, ${cellIndex}`;
                const currentCell = `${gridState.currentRow}, ${gridState.currentColumn}`;
                const cellData = cellState[cellPos] || {};
                const isActiveCell =
                  gameState === "running" && cellPos === currentCell;

                return (
                  <div
                    key={cellPos}
                    data-cell-pos={cellPos}
                    data-is-active={isActiveCell}
                    data-state={cellData.state}
                    className={`
                    border-2 flex shrink items-center justify-center w-11 h-11 uppercase font-bold text-2xl
                    data-[is-active=true]:border-green-500 data-[is-active=true]:color-green-500
                    data-[state=invalid]:bg-slate-500 data-[state=invalid]:text-white
                    data-[state=misplaced]:bg-yellow-500  data-[state=misplaced]:text-white
                    data-[state=valid]:bg-green-500 data-[state=valid]:text-white
                    `}
                  >
                    {cellData.letter}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
