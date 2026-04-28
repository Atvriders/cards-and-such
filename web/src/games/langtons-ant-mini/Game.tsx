import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AntState, AntAction, AntSettings } from "./state.js";
import { isTerminal, score, SIZE } from "./state.js";
import "./Game.css";

export function LangtonsAntMiniGame({ state, dispatch, onGameOver }: GameProps<AntState, AntSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="la-wrap">
      <div className="la-stats">Steps <b>{state.steps}</b> — Score <b>{score(state)}</b></div>
      <div className="la-grid" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
        {state.grid.map((v, i) => {
          const x = i % SIZE, y = Math.floor(i / SIZE);
          const isAnt = x === state.ax && y === state.ay;
          return <div key={i} className={`la-cell${v ? " la-black" : ""}${isAnt ? " la-ant" : ""}`} />;
        })}
      </div>
      <div className="la-controls">
        <button onClick={() => dispatch({ type: "step" } as AntAction)}>Step</button>
        <button onClick={() => { for (let i = 0; i < 10; i++) dispatch({ type: "step" } as AntAction); }}>Step x10</button>
        <button onClick={() => dispatch({ type: "reset" } as AntAction)}>Reset</button>
        {state.phase === "running" && <button className="la-finish" onClick={() => dispatch({ type: "finish" } as AntAction)}>Finish</button>}
      </div>
      {state.phase === "done" && <div className="la-done">Final: {score(state)}</div>}
    </div>
  );
}
