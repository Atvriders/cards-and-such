import type { GameProps } from "../../platform/game-plugin/types.js";
import { Card as CardView } from "../../engines/deck/Card.js";
import type { ClockPatienceState, ClockPatienceAction, ClockPatienceSettings } from "./state.js";
import "./Game.css";

export function ClockPatienceGame(
  { state, dispatch, onGameOver }: GameProps<ClockPatienceState, ClockPatienceSettings>,
): JSX.Element {
  if (state.won || state.lost) onGameOver(state.score);
  return (
    <div className="clock-patience-root">
      <div className="clock-patience-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Status: {state.won ? "WON" : state.lost ? "LOST" : "playing"}</span>
        <button
          className="clock-patience-auto"
          type="button"
          data-testid="hint-target-clock-patience-tick"
          onClick={() => dispatch({ type: "tick" } as ClockPatienceAction)}
          disabled={!state.held}
        >Tick</button>
      </div>
      <div className="clock-patience-rings">
        {state.rings.map((ring, i) => (
          <div key={i} className="clock-patience-slot">
            <div className="clock-patience-slot-label">{i + 1}</div>
            <div className="clock-patience-slot-cards">
              {ring.length > 0 && (
                <CardView card={ring[ring.length - 1]!} />
              )}
              {ring.length === 0 && <div className="clock-patience-empty">·</div>}
            </div>
          </div>
        ))}
      </div>
      <div className="clock-patience-held">
        Held: {state.held && <CardView card={state.held} />}
      </div>
    </div>
  );
}
