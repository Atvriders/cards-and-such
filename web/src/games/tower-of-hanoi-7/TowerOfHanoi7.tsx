import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TowerOfHanoi7State, TowerOfHanoi7Settings } from "./state.js";
import { reducer, isTerminal, MIN_MOVES } from "./state.js";
import "./TowerOfHanoi7.css";

const DISK_COLORS = [
  "#e53e3e", "#dd6b20", "#d69e2e", "#38a169",
  "#3182ce", "#805ad5", "#d53f8c",
];

const DISK_WIDTHS = [28, 42, 56, 70, 84, 98, 112];

export function TowerOfHanoi7({ state, dispatch, onGameOver }: GameProps<TowerOfHanoi7State, TowerOfHanoi7Settings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  return (
    <div className="toh7">
      <div className="toh7-info">
        <span>Moves: <strong>{state.moves}</strong></span>
        <span>Par: <strong>{MIN_MOVES}</strong></span>
        {terminal && <span>Score: <strong>{terminal.score}</strong></span>}
      </div>

      {terminal && <div className="toh7-won">Solved! Moves: {state.moves} / Par: {MIN_MOVES}</div>}

      <div className="toh7-pegs">
        {state.pegs.map((peg, pegIdx) => (
          <div
            key={pegIdx}
            className={`toh7-peg-wrapper${state.selectedPeg === pegIdx ? " selected" : ""}`}
            onClick={() => !terminal && dispatch({ type: "select", peg: pegIdx })}
          >
            <div className="toh7-stack">
              <div className="toh7-pole" />
              {[...peg].map((disk, di) => (
                <div
                  key={di}
                  className="toh7-disk"
                  style={{
                    width: `${DISK_WIDTHS[disk - 1] ?? 28}px`,
                    background: DISK_COLORS[(disk - 1) % DISK_COLORS.length],
                  }}
                >
                  {disk}
                </div>
              ))}
            </div>
            <div className="toh7-base" />
            <div className="toh7-peg-label">Peg {pegIdx + 1}</div>
          </div>
        ))}
      </div>

      {state.selectedPeg !== null && !terminal && (
        <div className="toh7-hint-box">
          Peg {state.selectedPeg + 1} selected — click destination peg
        </div>
      )}

      <div className="toh7-buttons">
        <button data-testid="hint-target-tower-of-hanoi-7-action" onClick={() => dispatch({ type: "restart" })}>Restart</button>
      </div>
    </div>
  );
}
