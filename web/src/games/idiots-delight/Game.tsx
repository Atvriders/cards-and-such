import { useState, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import { Card as CardView } from "../../engines/deck/Card.js";
import type { IdiotsDelightState, IdiotsDelightAction, IdiotsDelightSettings } from "./state.js";
import "./Game.css";

export function IdiotsDelightGame(
  { state, dispatch, onGameOver }: GameProps<IdiotsDelightState, IdiotsDelightSettings>,
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
      dispatch({ type: "discard", col: i } as IdiotsDelightAction);
      setSel(null);
      return;
    }
    dispatch({ type: "move", from: sel, to: i } as IdiotsDelightAction);
    setSel(null);
  }, [sel, dispatch]);
  return (
    <div className="idiots-delight-root">
      <div className="idiots-delight-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Stock: {state.stock.length}</span>
        <button
          className="idiots-delight-auto"
          type="button"
          onClick={() => dispatch({ type: "deal" } as IdiotsDelightAction)}
          disabled={state.stock.length === 0 && !state.won}
        >Deal</button>
      </div>
      <div className="idiots-delight-cols">
        {state.columns.map((col, i) => (
          <div key={i} className={"idiots-delight-col" + (sel === i ? " selected" : "")} onClick={() => click(i)}>
            {col.length > 0 && <CardView card={col[col.length - 1]!} />}
            {col.length === 0 && <div className="idiots-delight-empty" />}
            <div className="idiots-delight-cnt">{col.length}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
