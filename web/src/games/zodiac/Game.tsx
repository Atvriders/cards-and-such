import type { GameProps } from "../../platform/game-plugin/types.js";
import { Card as CardView } from "../../engines/deck/Card.js";
import type { ZodiacState, ZodiacAction, ZodiacSettings } from "./state.js";
import "./Game.css";

export function ZodiacGame(
  { state, dispatch, onGameOver }: GameProps<ZodiacState, ZodiacSettings>,
): JSX.Element {
  if (state.won || state.lost) onGameOver(state.score);
  return (
    <div className="zodiac-root">
      <div className="zodiac-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Status: {state.won ? "WON" : state.lost ? "LOST" : "playing"}</span>
        <button
          className="zodiac-auto"
          type="button"
          onClick={() => dispatch({ type: "tick" } as ZodiacAction)}
          disabled={!state.held}
        >Tick</button>
      </div>
      <div className="zodiac-rings">
        {state.rings.map((ring, i) => (
          <div key={i} className="zodiac-slot">
            <div className="zodiac-slot-label">{i + 1}</div>
            <div className="zodiac-slot-cards">
              {ring.length > 0 && (
                <CardView card={ring[ring.length - 1]!} />
              )}
              {ring.length === 0 && <div className="zodiac-empty">·</div>}
            </div>
          </div>
        ))}
      </div>
      <div className="zodiac-held">
        Held: {state.held && <CardView card={state.held} />}
      </div>
    </div>
  );
}
