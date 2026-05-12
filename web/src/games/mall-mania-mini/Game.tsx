import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MallState, MallAction, MallSettings } from "./state.js";
import { isTerminal, score, MALL, SIZE, TOTAL_TURNS } from "./state.js";
import "./Game.css";

export function MallManiaMiniGame({ state, dispatch, onGameOver }: GameProps<MallState, MallSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const shop = MALL[state.lastShop]!;
  return (
    <div className="mm-wrap fade-in">
      <div className="mm-stats">
        <div>Turn <b>{state.turn}/{TOTAL_TURNS}</b></div>
        <div>Budget <b>${state.budget}</b></div>
        <div>Items <b>{state.items}</b></div>
      </div>
      <div className="mm-grid" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
        {MALL.map((s, i) => (
          <div key={i} className={`mm-cell mm-${s.kind}${i === state.pos ? " mm-here" : ""}`}>
            <div className="mm-name">{s.label}</div>
            <div className="mm-price">${s.price}</div>
          </div>
        ))}
      </div>
      {state.phase === "rolling" && <button data-testid="hint-target-mall-mania-mini-primary" className="mm-btn" onClick={() => dispatch({ type: "roll" } as MallAction)}>Roll</button>}
      {state.phase === "deciding" && (
        <div className="mm-decide">
          At <b>{shop.label}</b> (${shop.price}, {shop.kind}). Buy?
          <div className="mm-buttons">
            <button onClick={() => dispatch({ type: "buy" } as MallAction)} disabled={state.budget < shop.price}>Buy</button>
            <button onClick={() => dispatch({ type: "skip" } as MallAction)}>Skip</button>
          </div>
        </div>
      )}
      {state.phase === "done" && <div className="mm-done bounce-in">Final score: {score(state)}</div>}
    </div>
  );
}
