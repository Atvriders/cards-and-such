import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ConwayState, ConwayAction, ConwaySettings } from "./state.js";
import { isTerminal, liveCount, score, SIZE } from "./state.js";
import "./Game.css";

export function GameOfLifeConwayGame({ state, dispatch, onGameOver }: GameProps<ConwayState, ConwaySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const live = liveCount(state.grid);
  return (
    <div className="conway-wrap">
      <div className="conway-stats">
        <div>Gen <b>{state.generation}</b></div>
        <div>Live <b>{live}</b></div>
        <div>Score <b>{score(state)}</b></div>
      </div>
      <div className="conway-grid" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
        {state.grid.map((v, i) => (
          <button
            key={i}
            className={`conway-cell${v ? " conway-on" : ""}`}
            onClick={() => state.phase === "editing" && dispatch({ type: "toggle", idx: i } as ConwayAction)}
            disabled={state.phase !== "editing"}
          />
        ))}
      </div>
      <div className="conway-controls">
        {state.phase === "editing" && (
          <>
            <button onClick={() => dispatch({ type: "preset", preset: "glider" } as ConwayAction)}>Glider</button>
            <button onClick={() => dispatch({ type: "preset", preset: "blinker" } as ConwayAction)}>Blinker</button>
            <button onClick={() => dispatch({ type: "preset", preset: "random" } as ConwayAction)}>Random</button>
          </>
        )}
        <button className="conway-step" onClick={() => dispatch({ type: "step" } as ConwayAction)}>Step</button>
        <button onClick={() => dispatch({ type: "reset" } as ConwayAction)}>Reset</button>
        {state.phase === "running" && (
          <button className="conway-finish" onClick={() => dispatch({ type: "finish" } as ConwayAction)}>Finish</button>
        )}
      </div>
      {state.phase === "done" && (
        <div className="conway-done">Final score: {score(state)}</div>
      )}
    </div>
  );
}
