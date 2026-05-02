import { useState, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import { Card as CardView } from "../../engines/deck/Card.js";
import type { AcesUpFiringSquadState, AcesUpFiringSquadAction, AcesUpFiringSquadSettings } from "./state.js";
import "./Game.css";

export function AcesUpFiringSquadGame(
  { state, dispatch, onGameOver }: GameProps<AcesUpFiringSquadState, AcesUpFiringSquadSettings>,
): JSX.Element {
  const [sel, setSel] = useState<number | null>(null);
  if (state.won) onGameOver(state.score);
  const click = useCallback((i: number) => {
    if (sel === null) {
      setSel(i);
      return;
    }
    if (sel === i) {
      // discard
      dispatch({ type: "discard", col: i } as AcesUpFiringSquadAction);
      setSel(null);
      return;
    }
    dispatch({ type: "move", from: sel, to: i } as AcesUpFiringSquadAction);
    setSel(null);
  }, [sel, dispatch]);
  return (
    <div className="aces-up-firing-squad-root">
      <div className="aces-up-firing-squad-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Stock: {state.stock.length}</span>
        <button
          className="aces-up-firing-squad-auto"
          type="button"
          data-testid="hint-target-aces-up-firing-squad-deal"
          onClick={() => dispatch({ type: "deal" } as AcesUpFiringSquadAction)}
          disabled={state.stock.length === 0 && !state.won}
        >Deal</button>
      </div>
      <div className="aces-up-firing-squad-cols">
        {state.columns.map((col, i) => (
          <div key={i} className={"aces-up-firing-squad-col" + (sel === i ? " selected" : "")} data-testid={`hint-target-aces-up-firing-squad-${i}`} onClick={() => click(i)}>
            {col.length > 0 && <CardView card={col[col.length - 1]!} />}
            {col.length === 0 && <div className="aces-up-firing-squad-empty" />}
            <div className="aces-up-firing-squad-cnt">{col.length}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
