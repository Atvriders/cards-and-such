import type { GameProps } from "../../platform/game-plugin/types.js";
import { Card as CardView } from "../../engines/deck/Card.js";
import type { SundialState, SundialAction, SundialSettings } from "./state.js";
import "./Game.css";

export function SundialGame(
  { state, dispatch, onGameOver }: GameProps<SundialState, SundialSettings>,
): JSX.Element {
  if (state.won || state.lost) onGameOver(state.score);
  return (
    <div className="sundial-root">
      <div className="sundial-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Status: {state.won ? "WON" : state.lost ? "LOST" : "playing"}</span>
        <button
          className="sundial-auto"
          type="button"
          data-testid="hint-target-sundial-tick"
          onClick={() => dispatch({ type: "tick" } as SundialAction)}
          disabled={!state.held}
        >Tick</button>
      </div>
      <div className="sundial-rings">
        {state.rings.map((ring, i) => (
          <div key={i} className="sundial-slot">
            <div className="sundial-slot-label">{i + 1}</div>
            <div className="sundial-slot-cards">
              {ring.length > 0 && (
                <CardView card={ring[ring.length - 1]!} />
              )}
              {ring.length === 0 && <div className="sundial-empty">·</div>}
            </div>
          </div>
        ))}
      </div>
      <div className="sundial-held">
        Held: {state.held && <CardView card={state.held} />}
      </div>
    </div>
  );
}
