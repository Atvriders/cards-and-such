import type { GameProps } from "../../platform/game-plugin/types.js";
import { Card as CardView } from "../../engines/deck/Card.js";
import type { ClockDoubleDeckState, ClockDoubleDeckAction, ClockDoubleDeckSettings } from "./state.js";
import "./Game.css";

export function ClockDoubleDeckGame(
  { state, dispatch, onGameOver }: GameProps<ClockDoubleDeckState, ClockDoubleDeckSettings>,
): JSX.Element {
  if (state.won || state.lost) onGameOver(state.score);
  return (
    <div className="clock-double-deck-root">
      <div className="clock-double-deck-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Status: {state.won ? "WON" : state.lost ? "LOST" : "playing"}</span>
        <button
          className="clock-double-deck-auto"
          type="button"
          onClick={() => dispatch({ type: "tick" } as ClockDoubleDeckAction)}
          disabled={!state.held}
        >Tick</button>
      </div>
      <div className="clock-double-deck-rings">
        {state.rings.map((ring, i) => (
          <div key={i} className="clock-double-deck-slot">
            <div className="clock-double-deck-slot-label">{i + 1}</div>
            <div className="clock-double-deck-slot-cards">
              {ring.length > 0 && (
                <CardView card={ring[ring.length - 1]!} />
              )}
              {ring.length === 0 && <div className="clock-double-deck-empty">·</div>}
            </div>
          </div>
        ))}
      </div>
      <div className="clock-double-deck-held">
        Held: {state.held && <CardView card={state.held} />}
      </div>
    </div>
  );
}
