import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NumberOrderState, NumberOrderSettings } from "./state.js";
import type { NumberOrderAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function NumberOrder({ state, dispatch, onGameOver }: GameProps<NumberOrderState, NumberOrderSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const hasMistake = state.message.includes("Not quite");
  const statusCls = `no-status${state.done ? " win" : hasMistake ? " wrong" : ""}`;

  return (
    <div className="no-game">
      <div className={statusCls}>{state.message}</div>
      <div className="no-info">Mistakes: {state.mistakes}</div>

      <div className="no-numbers">
        {state.numbers.map((n, i) => {
          const tapped = state.tapped.includes(i);
          return (
            <div
              key={i}
              className={`no-num${tapped ? " tapped" : ""}`}
              onClick={() => !tapped && !state.done && dispatch({ type: "tap", index: i } satisfies NumberOrderAction)}
            >
              {n}
            </div>
          );
        })}
      </div>

      {state.done && (
        <div className="no-score">
          Done! Score: {terminal?.score ?? 0} | Mistakes: {state.mistakes}
        </div>
      )}
    </div>
  );
}
