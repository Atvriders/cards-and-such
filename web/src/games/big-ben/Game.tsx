import type { GameProps } from "../../platform/game-plugin/types.js";
import { Card as CardView } from "../../engines/deck/Card.js";
import type { BigBenState, BigBenAction, BigBenSettings } from "./state.js";
import "./Game.css";

export function BigBenGame(
  { state, dispatch, onGameOver }: GameProps<BigBenState, BigBenSettings>,
): JSX.Element {
  if (state.won || state.lost) onGameOver(state.score);
  return (
    <div className="big-ben-root">
      <div className="big-ben-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Status: {state.won ? "WON" : state.lost ? "LOST" : "playing"}</span>
        <button
          className="big-ben-auto"
          type="button"
          data-testid="hint-target-big-ben-tick"
          onClick={() => dispatch({ type: "tick" } as BigBenAction)}
          disabled={!state.held}
        >Tick</button>
      </div>
      <div className="big-ben-rings">
        {state.rings.map((ring, i) => (
          <div key={i} className="big-ben-slot">
            <div className="big-ben-slot-label">{i + 1}</div>
            <div className="big-ben-slot-cards">
              {ring.length > 0 && (
                <CardView card={ring[ring.length - 1]!} />
              )}
              {ring.length === 0 && <div className="big-ben-empty">·</div>}
            </div>
          </div>
        ))}
      </div>
      <div className="big-ben-held">
        Held: {state.held && <CardView card={state.held} />}
      </div>
    </div>
  );
}
