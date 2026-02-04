import { useEffect, useMemo, useRef, useState } from "react";
import {
  changeDirection,
  createInitialState,
  step,
  DIRECTIONS,
} from "./game.js";

const GRID_SIZE = 20;
const TICK_MS = 140;

export default function App() {
  const rngRef = useRef(() => Math.random());
  const initial = useMemo(
    () => createInitialState(GRID_SIZE, GRID_SIZE, rngRef.current),
    []
  );
  const [game, setGame] = useState(initial);

  useEffect(() => {
    if (game.gameOver) return undefined;
    const id = setInterval(() => {
      setGame((prev) => step(prev, rngRef.current));
    }, TICK_MS);
    return () => clearInterval(id);
  }, [game.gameOver]);

  useEffect(() => {
    function handleKey(event) {
      const key = event.key.toLowerCase();
      const next =
        key === "arrowup" || key === "w"
          ? "up"
          : key === "arrowdown" || key === "s"
            ? "down"
            : key === "arrowleft" || key === "a"
              ? "left"
              : key === "arrowright" || key === "d"
                ? "right"
                : null;

      if (!next) return;
      event.preventDefault();
      setGame((prev) => changeDirection(prev, next));
    }

    window.addEventListener("keydown", handleKey, { passive: false });
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const snakeSet = useMemo(() => {
    const set = new Set();
    game.snake.forEach((segment) => set.add(`${segment.x},${segment.y}`));
    return set;
  }, [game.snake]);

  const cells = [];
  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const key = `${x},${y}`;
      const isHead = game.snake[0].x === x && game.snake[0].y === y;
      const isSnake = snakeSet.has(key);
      const isFood = game.food.x === x && game.food.y === y;
      const className = isFood
        ? "cell food"
        : isHead
          ? "cell head"
          : isSnake
            ? "cell snake"
            : "cell";
      cells.push(<div key={key} className={className} />);
    }
  }

  function restart() {
    setGame(createInitialState(GRID_SIZE, GRID_SIZE, rngRef.current));
  }

  return (
    <div className="page">
      <header className="top">
        <div>
          <h1>Snake</h1>
          <p className="hint">Use arrow keys or WASD. Eat food to grow.</p>
        </div>
        <div className="score">
          <div className="score-label">Score</div>
          <div className="score-value">{game.score}</div>
        </div>
      </header>

      <main className="board-wrap">
        <div
          className={`board ${game.gameOver ? "board-over" : ""}`}
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
          }}
        >
          {cells}
        </div>
        {game.gameOver && (
          <div className="overlay">
            <div className="overlay-card">
              <div className="overlay-title">Game Over</div>
              <div className="overlay-sub">Final score: {game.score}</div>
              <button className="primary" onClick={restart}>
                Restart
              </button>
            </div>
          </div>
        )}
      </main>

      <section className="controls">
        <button
          className="control"
          onClick={() => setGame((prev) => changeDirection(prev, "up"))}
          aria-label="Up"
        >
          ↑
        </button>
        <div className="controls-row">
          <button
            className="control"
            onClick={() => setGame((prev) => changeDirection(prev, "left"))}
            aria-label="Left"
          >
            ←
          </button>
          <button className="control" onClick={restart}>
            Restart
          </button>
          <button
            className="control"
            onClick={() => setGame((prev) => changeDirection(prev, "right"))}
            aria-label="Right"
          >
            →
          </button>
        </div>
        <button
          className="control"
          onClick={() => setGame((prev) => changeDirection(prev, "down"))}
          aria-label="Down"
        >
          ↓
        </button>
      </section>

      <footer className="footer">
        <button className="ghost" onClick={restart}>
          Restart Game
        </button>
      </footer>
    </div>
  );
}
