import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Make24State, Make24Settings, Make24Action } from "./state.js";
import { isTerminal } from "./state.js";
import "./Make24.css";

export function Make24({
  state,
  dispatch,
  onGameOver,
}: GameProps<Make24State, Make24Settings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  return (
    <div className="make-24">
      <div className="make-24-target">
        Make <span>24</span> using all four numbers
      </div>

      <div className="make-24-numbers">
        {state.numbers.map((n, i) => (
          <div key={i} className="make-24-num">{n}</div>
        ))}
      </div>

      <div className="make-24-ops">
        Operators: + − × ÷ and parentheses allowed · Use * for × and / for ÷
      </div>

      {!state.won && (
        <div className="make-24-input-area">
          <input
            className="make-24-input"
            type="text"
            value={state.expression}
            placeholder={`e.g. (${state.numbers[0]}+${state.numbers[1]}) * (${state.numbers[2]}-${state.numbers[3]})`}
            onChange={(e) =>
              dispatch({ type: "setExpression", value: e.target.value } as Make24Action)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") dispatch({ type: "submit" } as Make24Action);
            }}
            disabled={state.won}
          />
          <div className="make-24-actions">
            <button
              className="make-24-btn submit"
              onClick={() => dispatch({ type: "submit" } as Make24Action)}
              disabled={!state.expression.trim()}
            >
              Check
            </button>
            <button
              className="make-24-btn clear"
              onClick={() => dispatch({ type: "clear" } as Make24Action)}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {state.error && <div className="make-24-error">{state.error}</div>}
      {state.won && (
        <div className="make-24-status">
          {state.expression} = 24 ✓ Solved in {state.attempts} attempt{state.attempts !== 1 ? "s" : ""}!
        </div>
      )}

      <div className="make-24-info">Attempts: {state.attempts} · Difficulty: {state.settings.difficulty}</div>
    </div>
  );
}
