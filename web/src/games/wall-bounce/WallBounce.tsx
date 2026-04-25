import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WallBounceState, WallBounceAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./WallBounce.css";

export function WallBounce({
  state,
  dispatch,
  onGameOver,
}: GameProps<WallBounceState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  const [angle, setAngle] = useState(3);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  return (
    <div className="wall-bounce">
      <h2>WALL BOUNCE</h2>
      <div className="wb-info">
        <span>Shots left: <b>{state.shotsRemaining}</b></span>
        <span>Score: <b>{state.score}</b></span>
      </div>

      <div className="wb-targets">
        {state.targets.map((up, i) => (
          <div key={i} className={`wb-target${up ? " up" : " down"}`}>
            {up ? "▲" : "✓"}
          </div>
        ))}
      </div>

      {state.lastAngle !== null && (
        <div className="wb-last">
          Angle {state.lastAngle}: hit <b>{state.lastHits}</b> target{state.lastHits !== 1 ? "s" : ""}!
        </div>
      )}

      <div className="wb-controls">
        <label>Bounce Angle: <b>{angle}</b></label>
        <input
          type="range"
          min={1}
          max={5}
          value={angle}
          onChange={(e) => setAngle(Number(e.target.value))}
          disabled={state.gameOver}
        />
        <button
          onClick={() => dispatch({ type: "shoot", angle } as WallBounceAction)}
          disabled={state.gameOver}
        >
          Shoot!
        </button>
      </div>

      {terminal && (
        <div className="wb-gameover">
          Game over! Final score: {state.score}
        </div>
      )}
    </div>
  );
}
