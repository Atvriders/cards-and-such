import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PlinkoState } from "./state.js";
import { isTerminal } from "./state.js";
import type { plinkoSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./Plinko.css";

type PlinkoSettings = SettingsOf<typeof plinkoSettings>;

export function Plinko({
  state,
  dispatch,
  onGameOver,
}: GameProps<PlinkoState, PlinkoSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const rows = parseInt(state.settings.rows, 10);
  const lastChip = state.animating ?? state.history[state.history.length - 1] ?? null;

  return (
    <div className="plinko">
      <div className="plinko-info">
        <span>Chips: <strong>{state.totalChips - state.chipsUsed}</strong> left</span>
        <span>Score: <strong>{state.score}</strong></span>
      </div>

      {terminal && (
        <div className="plinko-done">All chips dropped! Final score: {terminal.score}</div>
      )}

      <div className="plinko-board">
        <div className="plinko-pegs">
          {Array.from({ length: rows }, (_, rowIdx) => (
            <div key={rowIdx} className="plinko-peg-row">
              {Array.from({ length: rowIdx + 1 }, (_, pegIdx) => (
                <div key={pegIdx} className="plinko-peg" />
              ))}
            </div>
          ))}
        </div>

        <div className="plinko-slots">
          {state.slotValues.map((val, idx) => (
            <div
              key={idx}
              className={`plinko-slot${lastChip && lastChip.slot === idx ? " landed" : ""}`}
            >
              <div className="plinko-slot-bar" />
              <div className="plinko-slot-value">{val}</div>
            </div>
          ))}
        </div>
      </div>

      {lastChip && (
        <div className="plinko-result">
          Last chip: +{lastChip.points} pts (slot {lastChip.slot + 1})
        </div>
      )}

      <button
        className="plinko-drop-btn"
        onClick={() => dispatch({ type: "drop" })}
        disabled={!!terminal || state.chipsUsed >= state.totalChips}
      >
        Drop Chip
      </button>
    </div>
  );
}
