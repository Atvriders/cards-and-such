import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CantStopState, CantStopAction, CantStopSettings } from "./state.js";
import { COLUMNS, COLUMN_HEIGHTS, isTerminal } from "./state.js";
import "./CantStop.css";

export function CantStop({
  state,
  dispatch,
  onGameOver,
}: GameProps<CantStopState, CantStopSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { phase, runners, players, lastRoll, validSplits, message, winner } = state;
  const player = players[0]!;
  const isPlayerTurn = state.currentPlayer === 0;

  const canRoll = phase === "preRoll" && isPlayerTurn && winner === null;
  const canBank =
    phase === "preRoll" &&
    isPlayerTurn &&
    winner === null &&
    Object.keys(runners).length > 0;

  function slotClass(col: number, slotIdx: number): string {
    const height = COLUMN_HEIGHTS[col]!;
    const step = height - slotIdx; // step 1 = top
    const runnerPos = runners[col];
    const bankedPos = player.banked[col];
    const claimedAt = player.claimed[col];

    if (claimedAt !== undefined && step <= claimedAt) return "cant-stop-slot claimed";
    if (runnerPos !== undefined && step <= runnerPos) return "cant-stop-slot runner";
    if (bankedPos !== undefined && step <= bankedPos) return "cant-stop-slot banked";
    return "cant-stop-slot";
  }

  return (
    <div className="cant-stop">
      <div className="cant-stop-board">
        {COLUMNS.map((col) => {
          const height = COLUMN_HEIGHTS[col]!;
          return (
            <div key={col} className="cant-stop-col">
              {Array.from({ length: height }, (_, i) => (
                <div key={i} className={slotClass(col, i)} />
              ))}
              <div className="cant-stop-col-label">{col}</div>
            </div>
          );
        })}
      </div>

      <div className="cant-stop-legend">
        <div className="cant-stop-legend-item">
          <div className="cant-stop-legend-dot claimed" /> Claimed
        </div>
        <div className="cant-stop-legend-item">
          <div className="cant-stop-legend-dot runner" /> Runner
        </div>
        <div className="cant-stop-legend-item">
          <div className="cant-stop-legend-dot banked" /> Banked
        </div>
      </div>

      {lastRoll && (
        <div className="cant-stop-dice">
          {lastRoll.map((v, i) => (
            <div key={i} style={{
              width: 36, height: 36, border: "2px solid #666",
              borderRadius: 6, display: "flex", alignItems: "center",
              justifyContent: "center", fontWeight: "bold", fontSize: "1.1rem",
              background: "#fff",
            }}>
              {v}
            </div>
          ))}
        </div>
      )}

      {phase === "pickSplit" && (
        <div className="cant-stop-splits">
          {validSplits.map((split, i) => (
            <button
              key={i}
              onClick={() =>
                dispatch({ type: "pickSplit", pairs: split } as CantStopAction)
              }
            >
              {split[0]} + {split[1]}
            </button>
          ))}
        </div>
      )}

      <div className={`cant-stop-message${winner === 0 ? " win" : phase === "busted" ? " bust" : ""}`}>
        {message}
      </div>

      <div className="cant-stop-controls">
        {phase === "preRoll" && winner === null && (
          <>
            <button disabled={!canRoll} onClick={() => dispatch({ type: "roll" } as CantStopAction)}>
              Roll
            </button>
            <button
              className="bank-btn"
              disabled={!canBank}
              onClick={() => dispatch({ type: "bank" } as CantStopAction)}
            >
              Bank
            </button>
          </>
        )}
        {phase === "busted" && (
          <button onClick={() => dispatch({ type: "continue" } as CantStopAction)}>
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
