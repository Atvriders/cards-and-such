import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ShutTheBoxState, ShutTheBoxAction, ShutTheBoxSettings } from "./state.js";
import { isTerminal, validCombinations } from "./state.js";
import "./ShutTheBox.css";

export function ShutTheBox({
  state,
  dispatch,
  onGameOver,
}: GameProps<ShutTheBoxState, ShutTheBoxSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const [selected, setSelected] = useState<number[]>([]);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  // Reset selection when phase changes
  useEffect(() => {
    setSelected([]);
  }, [state.phase]);

  function toggleTile(index: number) {
    if (state.phase !== "chooseTiles") return;
    if (!state.tiles[index]) return; // already closed

    setSelected((prev) => {
      if (prev.includes(index)) return prev.filter((i) => i !== index);
      return [...prev, index];
    });
  }

  function handleConfirm() {
    if (selected.length === 0) return;
    dispatch({ type: "closeTiles", indices: selected } as ShutTheBoxAction);
    setSelected([]);
  }

  const selectedSum = selected.reduce((s, i) => s + i + 1, 0);
  const isValidSelection = state.phase === "chooseTiles" && selectedSum === state.rollSum;
  const combos = state.phase === "chooseTiles"
    ? validCombinations(state.tiles, state.rollSum)
    : [];

  return (
    <div className="stb">
      <div className="stb-header">
        <h2>Shut the Box</h2>
        <span className="stb-score">Score: {state.score} (lower = better)</span>
      </div>

      <div className="stb-tiles">
        {Array.from({ length: 9 }, (_, i) => {
          const isOpen = state.tiles[i];
          const isSelected = selected.includes(i);
          return (
            <div
              key={i}
              data-testid={`hint-target-shut-the-box-tile-${i + 1}`}
              className={`stb-tile ${isOpen ? "open" : "closed"} ${isSelected ? "selected" : ""}`}
              onClick={() => toggleTile(i)}
            >
              {i + 1}
            </div>
          );
        })}
      </div>

      {state.roll && (
        <div className="stb-roll">
          Rolled: <strong>{state.roll[0]}</strong> + <strong>{state.roll[1]}</strong> = <strong>{state.rollSum}</strong>
        </div>
      )}

      <div className="stb-message">{state.message}</div>

      {state.phase === "preRoll" && (
        <button className="stb-btn" data-testid="hint-target-shut-the-box-roll" onClick={() => dispatch({ type: "roll" } as ShutTheBoxAction)}>
          Roll Dice
        </button>
      )}

      {state.phase === "chooseTiles" && (
        <div className="stb-choose">
          <div className="stb-combos">
            <strong>Valid combos:</strong>{" "}
            {combos.slice(0, 6).map((c, i) => (
              <span
                key={i}
                className="stb-combo-hint"
                onClick={() => {
                  const indices = c.map((v) => v - 1);
                  setSelected(indices);
                }}
              >
                [{c.join("+")}]
              </span>
            ))}
          </div>
          <div>Selected sum: {selectedSum} / {state.rollSum}</div>
          <button
            className="stb-btn"
            onClick={handleConfirm}
            disabled={!isValidSelection}
          >
            Close Selected Tiles
          </button>
        </div>
      )}

      {state.phase === "gameOver" && (
        <div className={`stb-game-over ${state.won ? "win" : "loss"}`}>
          {state.won ? `You beat the target! Final score: ${state.score}` : `Game over. Score: ${state.score} — target was ${state.settings.targetScore}`}
        </div>
      )}
    </div>
  );
}
