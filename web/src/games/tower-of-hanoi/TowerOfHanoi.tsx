import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TowerOfHanoiState } from "./state.js";
import { isTerminal, minMoves } from "./state.js";
import type { towerOfHanoiSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./TowerOfHanoi.css";

type TowerOfHanoiSettings = SettingsOf<typeof towerOfHanoiSettings>;

const DISK_COLORS = [
  "#e53e3e",
  "#dd6b20",
  "#d69e2e",
  "#38a169",
  "#3182ce",
  "#805ad5",
  "#d53f8c",
];

export function TowerOfHanoi({
  state,
  dispatch,
  onGameOver,
}: GameProps<TowerOfHanoiState, TowerOfHanoiSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const minM = minMoves(state.numDisks);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const maxWidth = state.numDisks * 14 + 24;

  return (
    <div className="tower-of-hanoi">
      <div className="toh-info">
        <span>Moves: <strong>{state.moves}</strong></span>
        <span>Min: <strong>{minM}</strong></span>
        <span>Hints: <strong>{state.hints}</strong></span>
      </div>

      {terminal && (
        <div className="toh-won">Solved! Score: {terminal.score}</div>
      )}

      <div className="toh-pegs">
        {state.pegs.map((peg, pegIdx) => (
          <div
            key={pegIdx}
            className={`toh-peg-wrapper${state.selectedPeg === pegIdx ? " selected" : ""}`}
            onClick={() => !terminal && dispatch({ type: "select", peg: pegIdx })}
          >
            <div className="toh-stack">
              <div className="toh-pole" />
              {peg.map((disk, di) => (
                <div
                  key={di}
                  className="toh-disk"
                  style={{
                    width: `${(disk / state.numDisks) * maxWidth + 24}px`,
                    background: DISK_COLORS[(disk - 1) % DISK_COLORS.length],
                  }}
                >
                  {disk}
                </div>
              ))}
            </div>
            <div className="toh-base" />
            <div className="toh-peg-label">Peg {pegIdx + 1}</div>
          </div>
        ))}
      </div>

      {state.selectedPeg !== null && !terminal && (
        <div className="toh-hint">
          Selected peg {state.selectedPeg + 1} — click destination peg
        </div>
      )}

      <div className="toh-controls">
        <button
          className="toh-hint-btn"
          onClick={() => dispatch({ type: "hint" })}
          disabled={!!terminal}
        >
          Hint (−50 pts)
        </button>
      </div>
    </div>
  );
}
