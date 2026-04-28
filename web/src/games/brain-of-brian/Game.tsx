import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BrianState, BrianAction, BrianSettings } from "./state.js";
import { isTerminal, score, liveCount, SIZE } from "./state.js";
import "./Game.css";

export function BrainOfBrianGame({ state, dispatch, onGameOver }: GameProps<BrianState, BrianSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const live = liveCount(state.grid);
  return (
    <div className="bb-wrap">
      <div className="bb-stats">Gen <b>{state.generation}</b> — Alive <b>{live}</b> — Score <b>{score(state)}</b></div>
      <div className="bb-grid" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
        {state.grid.map((v, i) => (
          <button key={i} className={`bb-cell bb-${v}`} onClick={() => state.phase === "editing" && dispatch({ type: "toggle", idx: i } as BrianAction)} disabled={state.phase !== "editing"} />
        ))}
      </div>
      <div className="bb-controls">
        {state.phase === "editing" && <button onClick={() => dispatch({ type: "random" } as BrianAction)}>Random</button>}
        <button className="bb-step" onClick={() => dispatch({ type: "step" } as BrianAction)}>Step</button>
        <button onClick={() => dispatch({ type: "reset" } as BrianAction)}>Reset</button>
        {state.phase === "running" && <button className="bb-finish" onClick={() => dispatch({ type: "finish" } as BrianAction)}>Finish</button>}
      </div>
    </div>
  );
}
