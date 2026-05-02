import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TenziState, TenziAction, TenziSettings, DieFace } from "./state.js";
import { isTerminal } from "./state.js";
import "./Tenzi.css";

export function Tenzi({
  state,
  dispatch,
  onGameOver,
}: GameProps<TenziState, TenziSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { phase, dice, locked, target, rollCount, numDice, message, winner } = state;
  const lockedCount = locked.filter(Boolean).length;

  function handleSetTarget(face: DieFace) {
    dispatch({ type: "setTarget", face } as TenziAction);
  }

  function handleRoll() {
    dispatch({ type: "roll" } as TenziAction);
  }

  return (
    <div className="tenzi">
      <div className="tenzi-header">
        Get all {numDice} dice to show the same face as fast as possible!
      </div>

      {phase === "pickTarget" && (
        <>
          <div style={{ color: "#555", fontSize: "0.9rem" }}>
            Choose your target face (the number you'll try to collect):
          </div>
          <div className="tenzi-target-row">
            {([1, 2, 3, 4, 5, 6] as DieFace[]).map((f) => (
              <button
                key={f}
                className={`tenzi-target-btn${target === f ? " active" : ""}`}
                onClick={() => handleSetTarget(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </>
      )}

      {target !== null && (
        <div style={{ fontSize: "0.9rem", color: "#666" }}>
          Target: <strong style={{ fontSize: "1.1rem", color: "#f0a500" }}>{target}</strong>
          {" — "}locked: <strong>{lockedCount}/{numDice}</strong>
        </div>
      )}

      <div className="tenzi-dice-grid">
        {dice.map((v, i) => (
          <div key={i} className={`tenzi-die${locked[i] ? " locked" : ""}`}>
            {v}
          </div>
        ))}
      </div>

      <div className="tenzi-stats">Rolls: {rollCount}</div>

      {phase === "rolling" && (
        <button data-testid="hint-target-tenzi-roll" className="tenzi-roll-btn" onClick={handleRoll}>
          Roll!
        </button>
      )}

      <div className={`tenzi-message${winner ? " done" : ""}`}>
        {message}
      </div>

      {winner && (
        <div className="tenzi-progress">
          Score: {Math.max(0, numDice * 10 - rollCount)} pts
        </div>
      )}
    </div>
  );
}
