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

    const currentGuess = getCurrentGuess();
    handleSubmitGuess(currentGuess, Object.values(newCellState));
  }, [answer, cellState, getCurrentGuess, handleSubmitGuess]);

  useEffect(() => {
    const handleKeypress = (event) => {
      if (["waiting", "ended"].includes(gameState)) return;

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

      <div
        className={`grid relative ${
          gameState === "waiting" ? "cursor-not-allowed" : ""
        } gap-4 p-2 grid-rows-${numRows} grid-cols-${numColumns}`}
      >
        {gameState !== "running" && (
          <div className=" bg-slate-900 opacity-50 absolute top-0 right-0 left-0 bottom-0" />
        )}
        {grid.map((row, rowIndex) => {
          return (
            <div key={rowIndex} className="flex gap-2">
              {row.map((cell, cellIndex) => {
                const cellPos = `${rowIndex}, ${cellIndex}`;
                const currentCell = `${gridState.currentRow}, ${gridState.currentColumn}`;
                const cellData = cellState[cellPos] || {};
                const isActiveCell = cellPos === currentCell;

                return (
                  <div
                    key={cellPos}
                    data-cell-pos={cellPos}
                    data-is-active={isActiveCell}
                    data-state={cellData.state}
                    className={`
                    border flex items-center justify-center w-[62px] h-[62px] uppercase font-bold text-2xl
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
