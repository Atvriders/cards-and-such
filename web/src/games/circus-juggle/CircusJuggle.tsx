import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CircusJuggleState, CircusJuggleSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./CircusJuggle.css";

export function CircusJuggle({ state, dispatch, onGameOver }: GameProps<CircusJuggleState, CircusJuggleSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  return (
    <div className="circus-juggle">
      <div className="cj-stats">
        <span>Caught: {state.catchCount}</span>
        <span>Streak: {state.streak}</span>
        <span>Dropped: {state.dropCount}</span>
      </div>

      <div className="cj-stage">
        {state.balls.map(ball => {
          const left = 40 + (ball.id * 60) % 240;
          const bottom = (ball.height / 10) * 160;
          const catchable = ball.height <= 2;
          return (
            <button
              key={ball.id}
              className={`cj-ball${catchable ? " catchable" : ""}`}
              style={{ left: `${left}px`, bottom: `${bottom}px` }}
              onClick={() => dispatch({ type: "catch", id: ball.id })}
              disabled={state.gameOver}
              title={catchable ? "Catch!" : "Too high!"}
            >
              {ball.label}
            </button>
          );
        })}
      </div>

      <div className="cj-result">{state.lastResult}</div>
      <div className="cj-message">{state.message}</div>

      <div className="cj-controls">
        {!state.gameOver && (
          <button onClick={() => dispatch({ type: "tick" })}>⏩ Tick</button>
        )}
        <button onClick={() => dispatch({ type: "restart" })}>New Show</button>
      </div>
    </div>
  );
}
