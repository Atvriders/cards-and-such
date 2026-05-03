import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MysticValeCraftState, MysticValeCraftAction, MysticValeCraftSettings } from "./state.js";
import { isTerminal, TOTAL_TURNS, SHOP, cardById, totalScore } from "./state.js";
import "./Game.css";

export function MysticValeCraftGame({ state, dispatch, onGameOver }: GameProps<MysticValeCraftState, MysticValeCraftSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    const score = totalScore(state);
    return (
      <div className="myv-wrap">
        <div className="myv-done">
          <h2>Tallied</h2>
          <div className="myv-stats">{score} VP &middot; {state.deck.length + state.discard.length + state.hand.length + state.played.length} cards in deck</div>
          <div className="myv-final">{score * 5} pts</div>
        </div>
      </div>
    );
  }

  return (
    <div className="myv-wrap">
      <div className="myv-header">
        <span className="myv-progress">Turn {state.turn} / {TOTAL_TURNS}</span>
        <span className="myv-coin">{state.coin} coin</span>
        <span className="myv-vp">{state.vpTotal} VP</span>
      </div>
      <div className="myv-section-label">Hand</div>
      <div className="myv-row">
        {state.phase === "play" && state.hand.map((id, i) => {
          const c = cardById(id);
          return <div key={i} className={`myv-card ${c.kind}`}><div className="myv-name">{c.name}</div><div className="myv-stats-line">{c.coin > 0 ? `+${c.coin}c` : c.vp > 0 ? `+${c.vp}VP` : ""}</div></div>;
        })}
        {state.phase !== "play" && state.played.map((id, i) => {
          const c = cardById(id);
          return <div key={i} className={`myv-card ${c.kind} played`}><div className="myv-name">{c.name}</div><div className="myv-stats-line">{c.coin > 0 ? `+${c.coin}c` : c.vp > 0 ? `+${c.vp}VP` : ""}</div></div>;
        })}
      </div>
      {state.phase === "play" && (
        <button data-testid="hint-target-mystic-vale-craft-primary" className="myv-btn primary" onClick={() => dispatch({ type: "playAll" } as MysticValeCraftAction)}>Play All</button>
      )}
      {state.phase === "buy" && (
        <>
          <div className="myv-section-label">Shop &middot; pick one to buy</div>
          <div className="myv-shop">
            {SHOP.filter(c => c.kind !== "starter").map(c => {
              const can = state.coin >= c.cost && !state.bought;
              return (
                <button key={c.id} className={`myv-shopcard ${c.kind}${can ? "" : " locked"}${state.bought === c.id ? " bought" : ""}`} disabled={!can} onClick={() => dispatch({ type: "buy", cardId: c.id } as MysticValeCraftAction)}>
                  <div className="myv-name">{c.name}</div>
                  <div className="myv-cost">{c.cost}c</div>
                  <div className="myv-stats-line">{c.coin > 0 ? `+${c.coin}c` : `+${c.vp}VP`}</div>
                </button>
              );
            })}
          </div>
          <div className="myv-actions">
            {state.bought ? <div className="myv-feedback">Bought {cardById(state.bought).name}</div> : <div className="myv-feedback">Or pass on a buy</div>}
            <button data-testid="hint-target-mystic-vale-craft-next" className="myv-btn" onClick={() => dispatch({ type: "endTurn" } as MysticValeCraftAction)}>End Turn</button>
          </div>
        </>
      )}
    </div>
  );
}
