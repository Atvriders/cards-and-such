import type { GameProps } from "../../platform/game-plugin/types.js";
import { Card as CardView } from "../../engines/deck/Card.js";
import type { ZodiacPatienceState, ZodiacPatienceAction, ZodiacPatienceSettings } from "./state.js";
import "./Game.css";

export function ZodiacPatienceGame(
  { state, dispatch, onGameOver }: GameProps<ZodiacPatienceState, ZodiacPatienceSettings>,
): JSX.Element {
  if (state.won || state.lost) onGameOver(state.score);
  return (
    <div className="zodiac-patience-root fade-in">
      <div className="zodiac-patience-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Status: {state.won ? "WON" : state.lost ? "LOST" : "playing"}</span>
        <button
          className="zodiac-patience-auto"
          type="button"
          data-testid="hint-target-zodiac-patience-tick"
          onClick={() => dispatch({ type: "tick" } as ZodiacPatienceAction)}
          disabled={!state.held}
        >Tick</button>
      </div>
      <div className="zodiac-patience-rings">
        {state.rings.map((ring, i) => (
          <div key={i} className="zodiac-patience-slot">
            <div className="zodiac-patience-slot-label">{i + 1}</div>
            <div className="zodiac-patience-slot-cards">
              {ring.length > 0 && (
                <CardView card={ring[ring.length - 1]!} />
              )}
              {ring.length === 0 && <div className="zodiac-patience-empty">·</div>}
            </div>
          </div>
        ))}
      </div>
      <div className="zodiac-patience-held">
        Held: {state.held && <CardView card={state.held} />}
      </div>
    </div>
  );
}
