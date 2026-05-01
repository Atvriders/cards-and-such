import type { GameProps } from "../../platform/game-plugin/types.js";
import { Card as CardView } from "../../engines/deck/Card.js";
import type { ZodiacPatState, ZodiacPatAction, ZodiacPatSettings } from "./state.js";
import "./Game.css";

export function ZodiacPatGame(
  { state, dispatch, onGameOver }: GameProps<ZodiacPatState, ZodiacPatSettings>,
): JSX.Element {
  if (state.won || state.lost) onGameOver(state.score);
  return (
    <div className="zodiac-pat-root">
      <div className="zodiac-pat-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Status: {state.won ? "WON" : state.lost ? "LOST" : "playing"}</span>
        <button
          className="zodiac-pat-auto"
          type="button"
          onClick={() => dispatch({ type: "tick" } as ZodiacPatAction)}
          disabled={!state.held}
        >Tick</button>
      </div>
      <div className="zodiac-pat-rings">
        {state.rings.map((ring, i) => (
          <div key={i} className="zodiac-pat-slot">
            <div className="zodiac-pat-slot-label">{i + 1}</div>
            <div className="zodiac-pat-slot-cards">
              {ring.length > 0 && (
                <CardView card={ring[ring.length - 1]!} />
              )}
              {ring.length === 0 && <div className="zodiac-pat-empty">·</div>}
            </div>
          </div>
        ))}
      </div>
      <div className="zodiac-pat-held">
        Held: {state.held && <CardView card={state.held} />}
      </div>
    </div>
  );
}
