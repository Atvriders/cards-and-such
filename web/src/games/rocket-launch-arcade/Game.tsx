import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RocketLaunchState, RocketLaunchSettings, RocketLaunchAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function RocketLaunchGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<RocketLaunchState, RocketLaunchSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const cells = Array.from({ length: 9 }, (_, i) => i);

  return (
    <div className="rla-game">
      <div className="rla-title">Rocket Launch</div>
      <div className="rla-hud">
        <span>Score: {state.score}</span>
        <span>Rounds: {state.roundsLeft}</span>
        <span>Fuel: {state.fuel}/{state.maxFuel}</span>
        <span>Hits: {state.hits}</span>
      </div>

      <div className="rla-grid">
        {cells.map((i) => (
          <div
            key={i}
            className={`rla-cell${i === state.targetX ? " target" : ""}${i === state.rocketX ? " rocket" : ""}`}
          >
            {i === state.rocketX && state.phase === "launching" ? "🚀" : i === state.rocketX ? "🚀" : i === state.targetX ? "🎯" : ""}
          </div>
        ))}
      </div>

      {state.phase === "result" && (
        <div className={`rla-result ${state.lastHit ? "hit" : "miss"}`}>
          {state.lastHit ? "Direct Hit! +points" : "Miss!"}
        </div>
      )}

      <div className="rla-controls">
        {state.phase === "aim" && (
          <>
            <button onClick={() => dispatch({ type: "move-left" } as RocketLaunchAction)} disabled={state.rocketX === 0 || state.fuel === 0}>◀ Left</button>
            <button className="rla-launch-btn" onClick={() => dispatch({ type: "launch" } as RocketLaunchAction)}>Launch!</button>
            <button onClick={() => dispatch({ type: "move-right" } as RocketLaunchAction)} disabled={state.rocketX === 8 || state.fuel === 0}>Right ▶</button>
          </>
        )}
        {state.phase === "result" && !state.gameOver && (
          <button className="rla-next-btn" onClick={() => dispatch({ type: "next-round" } as RocketLaunchAction)}>Next Round</button>
        )}
      </div>

      {state.gameOver && (
        <div className="rla-gameover">
          {state.won ? "Mission Success!" : "Mission Failed"}<br />
          <span>Final Score: {state.score} | Hits: {state.hits}/{state.hits + state.misses}</span>
        </div>
      )}
    </div>
  );
}
