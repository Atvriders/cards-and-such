import { useEffect, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CoinCollectorState, CoinCollectorSettings, CoinCollectorAction, Dir } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const COIN_EMOJI: Record<number, string> = { 1: "🪙", 5: "⑤", 10: "⑩", 25: "㉕" };
const COIN_COLOR: Record<number, string> = { 1: "#c0a830", 5: "#aaa", 10: "#f0c040", 25: "#a0e0ff" };

export function CoinCollector({
  state,
  dispatch,
  onGameOver,
}: GameProps<CoinCollectorState, CoinCollectorSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const handleKey = useCallback((e: KeyboardEvent) => {
    const map: Record<string, Dir> = {
      ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
      w: "up", s: "down", a: "left", d: "right",
    };
    const dir = map[e.key];
    if (dir) {
      e.preventDefault();
      dispatch({ type: "move", dir } as CoinCollectorAction);
    }
  }, [dispatch]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  const { gridSize, grid, playerRow, playerCol } = state;

  return (
    <div className="cc-game">
      <div className="cc-title">Coin Collector</div>
      <div className="cc-stats">
        <span>Score: <strong>{state.score}</strong></span>
        <span>Turns: <strong>{state.turnsLeft}</strong></span>
        <span>Coins: {state.coinsCollected}/{state.totalCoins}</span>
      </div>

      <div
        className="cc-grid"
        style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
      >
        {grid.map((cell, idx) => {
          const r = Math.floor(idx / gridSize);
          const c = idx % gridSize;
          const isPlayer = r === playerRow && c === playerCol;
          return (
            <div
              key={idx}
              className={`cc-cell ${isPlayer ? "player" : ""}`}
              style={{
                background: isPlayer ? "#3355ff"
                  : cell !== null ? "rgba(255,215,0,0.08)"
                  : "rgba(255,255,255,0.04)",
              }}
            >
              {isPlayer ? (
                <span className="cc-player">★</span>
              ) : cell !== null ? (
                <span className="cc-coin" style={{ color: COIN_COLOR[cell] }}>
                  {COIN_EMOJI[cell] ?? "🪙"}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      {!state.gameOver && (
        <div className="cc-controls">
          <div className="cc-ctrl-row">
            <button onClick={() => dispatch({ type: "move", dir: "up" } as CoinCollectorAction)} aria-label="Up" data-tooltip="Move up">▲</button>
          </div>
          <div className="cc-ctrl-row">
            <button onClick={() => dispatch({ type: "move", dir: "left" } as CoinCollectorAction)} aria-label="Previous" data-tooltip="Previous">◀</button>
            <button onClick={() => dispatch({ type: "move", dir: "down" } as CoinCollectorAction)} aria-label="Down" data-tooltip="Move down">▼</button>
            <button onClick={() => dispatch({ type: "move", dir: "right" } as CoinCollectorAction)} aria-label="Next" data-tooltip="Next">▶</button>
          </div>
          <div className="cc-hint">Arrow keys / WASD</div>
        </div>
      )}

      {state.gameOver && (
        <div className="cc-game-over">
          <div>{state.won ? "All coins collected!" : "Out of turns!"}</div>
          <div>Final score: {terminal?.score}</div>
          <button className="cc-restart-btn" onClick={() => dispatch({ type: "restart" } as CoinCollectorAction)}>
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
