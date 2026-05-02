import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceTowerStackState, DiceTowerStackSettings } from "./state.js";
import { isTerminal, isPerfect, stackScore, ROUNDS, PERFECT_BONUS } from "./state.js";
import "./Game.css";

export function DiceTowerStackGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<DiceTowerStackState, DiceTowerStackSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const previewScore = stackScore(state.dice, state.selected);
  const wouldBePerfect = isPerfect(state.dice, state.selected);

  return (
    <div className="dts-root">
      <div className="dts-info">
        <span>Round <strong>{state.round}/{ROUNDS}</strong></span>
        <span>Total <strong>{state.totalScore}</strong></span>
        <span>Perfect <strong>{state.perfectCount}</strong></span>
      </div>

      {terminal ? (
        <div className="dts-ended">
          Done! Final score: {terminal.score} (perfects: {state.perfectCount})
        </div>
      ) : (
        <>
          <div className="dts-dice-row">
            {state.dice.map((v, i) => {
              const selPos = state.selected.indexOf(i);
              const isSel = selPos >= 0;
              return (
                <button data-testid="hint-target-dice-tower-stack-select"
                  key={i}
                  type="button"
                  className={`dts-die${isSel ? " dts-die--selected" : ""}`}
                  onClick={() => dispatch({ type: "select", idx: i })}
                  disabled={state.committed}
                  aria-label={`Die ${i + 1} value ${v}`}
                >
                  <span className="dts-die-value">{v}</span>
                  {isSel && <span className="dts-die-pos">#{selPos + 1}</span>}
                </button>
              );
            })}
          </div>

          <div className="dts-stack">
            <div className="dts-stack-label">Tower:</div>
            <div className="dts-stack-blocks">
              {state.selected.length === 0 ? (
                <span className="dts-stack-empty">(empty)</span>
              ) : (
                state.selected.map((di, i) => (
                  <div key={i} className="dts-stack-block">{state.dice[di]}</div>
                ))
              )}
            </div>
            <div className="dts-stack-meta">
              Stack score: <strong>{previewScore}</strong>
              {wouldBePerfect && state.selected.length === state.dice.length && (
                <span className="dts-bonus"> +{PERFECT_BONUS} perfect bonus</span>
              )}
            </div>
          </div>

          <div className="dts-actions">
            {!state.committed ? (
              <>
                <button data-testid="hint-target-dice-tower-stack-clear" type="button" className="dts-btn" onClick={() => dispatch({ type: "clear" })}>
                  Clear
                </button>
                <button data-testid="hint-target-dice-tower-stack-commit"
                  type="button"
                  className="dts-btn dts-btn--primary"
                  onClick={() => dispatch({ type: "commit" })}
                >
                  Commit Stack
                </button>
              </>
            ) : (
              <button data-testid="hint-target-dice-tower-stack-next"
                type="button"
                className="dts-btn dts-btn--primary"
                onClick={() => dispatch({ type: "next" })}
              >
                {state.round >= ROUNDS ? "Finish" : "Next Round"}
              </button>
            )}
          </div>

          <div className="dts-hint">
            Click dice in roll order to stack with strictly ascending values.
          </div>
        </>
      )}
    </div>
  );
}
