import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Life1dState, Life1dAction, Life1dSettings } from "./state.js";
import { isTerminal, score, WIDTH } from "./state.js";
import "./Game.css";

export function Life1dGame({ state, dispatch, onGameOver }: GameProps<Life1dState, Life1dSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="l1-wrap">
      <div className="l1-stats">Rule {state.rule} — Gen <b>{state.generation}</b> — Unique <b>{state.uniqueCount}</b></div>
      <div className="l1-row" style={{ gridTemplateColumns: `repeat(${WIDTH}, 1fr)` }}>
        {state.row.map((v, i) => <div key={i} className={`l1-cell${v ? " l1-on" : ""}`} />)}
      </div>
      <div className="l1-controls">
        <button onClick={() => dispatch({ type: "step" } as Life1dAction)}>Step</button>
        <button onClick={() => dispatch({ type: "step10" } as Life1dAction)}>Step x10</button>
        <button onClick={() => dispatch({ type: "reset" } as Life1dAction)}>Reset</button>
        {state.phase === "running" && <button className="l1-finish" onClick={() => dispatch({ type: "finish" } as Life1dAction)}>Finish</button>}
      </div>
      {state.phase === "done" && <div className="l1-done">Final: {score(state)}</div>}
    </div>
  );
}
