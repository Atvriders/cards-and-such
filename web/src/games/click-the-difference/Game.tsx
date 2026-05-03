import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ClickDiffState, ClickDiffSettings } from "./state.js";
import { isTerminal, ROUNDS, GRID_SIZE } from "./state.js";
import "./Game.css";

export function ClickTheDifferenceGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<ClickDiffState, ClickDiffSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  return (
    <div className="ctd-root">
      <div className="ctd-info">
        <span>Round <strong>{state.round}/{ROUNDS}</strong></span>
        <span>Score <strong>{state.score}</strong></span>
        <span>Solved <strong>{state.correctRounds}</strong></span>
        <span>Misses <strong>{state.attempts}</strong></span>
      </div>

      {terminal ? (
        <div className="ctd-ended">
          Done! Final score: {terminal.score} ({state.correctRounds}/{ROUNDS} solved)
        </div>
      ) : (
        <>
          <div className="ctd-grids">
            <div className="ctd-grid-wrap">
              <div className="ctd-grid-label">Reference</div>
              <div className="ctd-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
                {state.current.gridA.map((e, i) => (
                  <div key={i} className="ctd-cell ctd-cell--ref">
                    {e}
                  </div>
                ))}
              </div>
            </div>
            <div className="ctd-grid-wrap">
              <div className="ctd-grid-label">Find the different one</div>
              <div className="ctd-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
                {state.current.gridB.map((e, i) => {
                  const isDiff = state.solved && i === state.current.diffIndex;
                  return (
                    <button
                      key={i}
                      type="button"
                      className={`ctd-cell ctd-cell--btn${isDiff ? " ctd-cell--found" : ""}`}
                      onClick={() => dispatch({ type: "click", idx: i })}
                      disabled={state.solved}
                      aria-label={`Cell ${i + 1}`}
                    >
                      {e}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {state.solved && (
            <button
              data-testid="hint-target-click-the-difference-action" type="button"
              className="ctd-btn ctd-btn--primary"
              onClick={() => dispatch({ type: "next" })}
            >
              {state.round >= ROUNDS ? "Finish" : "Next Round"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
