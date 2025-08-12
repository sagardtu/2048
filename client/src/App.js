import React, { useEffect, useState } from "react";
import "./App.css";

const SIZE = 4;

const modal = document.getElementById("howToPlayModal");
const btn = document.getElementById("howToPlayBtn");
const closeBtn = document.getElementById("closeModal");

btn.onclick = function () {
  modal.style.display = "block";
};

closeBtn.onclick = function () {
  modal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target === modal) {
    modal.style.display = "none";
  }
};

const generateEmptyGrid = () => {
  return Array(SIZE)
    .fill()
    .map(() => Array(SIZE).fill(0));
};

const addRandomTile = (grid) => {
  const emptyCells = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 0) emptyCells.push([r, c]);
    }
  }
  if (emptyCells.length === 0) return grid;
  const [r, c] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  grid[r][c] = Math.random() < 0.9 ? 2 : 4;
  return grid;
};

const isGameOver = (grid) => {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 0) return false;
      if (c < SIZE - 1 && grid[r][c] === grid[r][c + 1]) return false;
      if (r < SIZE - 1 && grid[r][c] === grid[r + 1][c]) return false;
    }
  }
  return true;
};

const transpose = (grid) => grid[0].map((_, c) => grid.map((row) => row[c]));
const reverse = (grid) => grid.map((row) => [...row].reverse());

const operateRow = (row) => {
  let scoreGained = 0;
  let newRow = row.filter((val) => val !== 0);
  for (let i = 0; i < newRow.length - 1; i++) {
    if (newRow[i] === newRow[i + 1]) {
      newRow[i] *= 2;
      scoreGained += newRow[i];
      newRow[i + 1] = 0;
    }
  }
  newRow = newRow.filter((val) => val !== 0);
  while (newRow.length < SIZE) newRow.push(0);
  return { row: newRow, scoreGained };
};

const App = () => {
  const [grid, setGrid] = useState(() =>
    addRandomTile(addRandomTile(generateEmptyGrid()))
  );
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const restartGame = () => {
    setGrid(addRandomTile(addRandomTile(generateEmptyGrid())));
    setScore(0);
  };

  const handleMove = (direction) => {
    let moved = false;
    let newScore = 0;

    const applyOperation = (g) => {
      return g.map((row) => {
        const { row: newRow, scoreGained } = operateRow(row);
        newScore += scoreGained;
        return newRow;
      });
    };

    let newGrid = [...grid];

    if (direction === "ArrowLeft") {
      newGrid = applyOperation(newGrid);
    } else if (direction === "ArrowRight") {
      newGrid = reverse(applyOperation(reverse(newGrid)));
    } else if (direction === "ArrowUp") {
      newGrid = transpose(applyOperation(transpose(newGrid)));
    } else if (direction === "ArrowDown") {
      newGrid = transpose(reverse(applyOperation(reverse(transpose(newGrid)))));
    }

    if (JSON.stringify(newGrid) !== JSON.stringify(grid)) {
      moved = true;
    }

    if (moved) {
      const updatedGrid = addRandomTile(newGrid);
      setGrid(updatedGrid);
      setScore((prev) => {
        const newTotal = prev + newScore;
        if (newTotal > highScore) {
          setHighScore(newTotal);
        }
        return newTotal;
      });

      // if (isGameOver(updatedGrid)) {
      //   setTimeout(() => {
      //     alert("Game Over! Click Restart to play again.");
      //   }, 100);
      // }

      // updated game over popup modal
      if (isGameOver(updatedGrid)) {
        setTimeout(() => {
          document.getElementById("customGameOverModal").style.display = "flex";
        }, 100);
      }

      document.getElementById("customCloseModalBtn").onclick = function () {
        document.getElementById("customGameOverModal").style.display = "none";
      };
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        handleMove(e.key);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [grid]);

  return (
    <div className="App">
      <div className="title">
        <h1>2048 Game</h1>
        <button className="restart-btn" onClick={restartGame}>
          Restart
        </button>
      </div>

      <div className="grid">
        {grid.map((row, i) => (
          <div className="row" key={i}>
            {row.map((cell, j) => (
              <div className="cell" key={j}>
                {cell !== 0 ? cell : ""}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="score">
        <p className="useText">Score: {score}</p>
        <p className="useText">High Score: {highScore}</p>
      </div>

      <div className="foot">
        <p>This website is developed by Sagar Kumar</p>
      </div>
    </div>
  );
};

export default App;
