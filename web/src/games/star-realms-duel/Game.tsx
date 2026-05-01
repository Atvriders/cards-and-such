import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { StarRealmsDuelState, StarRealmsDuelAction, StarRealmsDuelSettings } from "./state.js";
import { isTerminal, TOTAL_TURNS, SHOP, cardById, totalScore } from "./state.js";
import "./Game.css";

export function StarRealmsDuelGame({ state, dispatch, onGameOver }: GameProps<StarRealmsDuelState, StarRealmsDuelSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    const score = totalScore(state);
    return (
      <div className="str-wrap">
        <div className="str-done">
          <h2>Tallied</h2>
          <div className="str-stats">{score} VP &middot; {state.deck.length + state.discard.length + state.hand.length + state.played.length} cards in deck</div>
          <div className="str-final">{score * 5} pts</div>
        </div>
      </div>
    );
  }

  return (
    <div className="str-wrap">
      <div className="str-header">
        <span className="str-progress">Turn {state.turn} / {TOTAL_TURNS}</span>
        <span className="str-coin">{state.coin} coin</span>
        <span className="str-vp">{state.vpTotal} VP</span>
      </div>
      <div className="str-section-label">Hand</div>
      <div className="str-row">
        {state.phase === "play" && state.hand.map((id, i) => {
          const c = cardById(id);
          return <div key={i} className={`str-card ${c.kind}`}><div className="str-name">{c.name}</div><div className="str-stats-line">{c.coin > 0 ? `+${c.coin}c` : c.vp > 0 ? `+${c.vp}VP` : ""}</div></div>;
        })}
        {state.phase !== "play" && state.played.map((id, i) => {
          const c = cardById(id);
          return <div key={i} className={`str-card ${c.kind} played`}><div className="str-name">{c.name}</div><div className="str-stats-line">{c.coin > 0 ? `+${c.coin}c` : c.vp > 0 ? `+${c.vp}VP` : ""}</div></div>;
        })}
      </div>
      {state.phase === "play" && (
        <button className="str-btn primary" onClick={() => dispatch({ type: "playAll" } as StarRealmsDuelAction)}>Play All</button>
      )}
      {state.phase === "buy" && (
        <>
          <div className="str-section-label">Shop &middot; pick one to buy</div>
          <div className="str-shop">
            {SHOP.filter(c => c.kind !== "starter").map(c => {
              const can = state.coin >= c.cost && !state.bought;
              return (
                <button key={c.id} className={`str-shopcard ${c.kind}${can ? "" : " locked"}${state.bought === c.id ? " bought" : ""}`} disabled={!can} onClick={() => dispatch({ type: "buy", cardId: c.id } as StarRealmsDuelAction)}>
                  <div className="str-name">{c.name}</div>
                  <div className="str-cost">{c.cost}c</div>
                  <div className="str-stats-line">{c.coin > 0 ? `+${c.coin}c` : `+${c.vp}VP`}</div>
                </button>
              );
            })}
          </div>
          <div className="str-actions">
            {state.bought ? <div className="str-feedback">Bought {cardById(state.bought).name}</div> : <div className="str-feedback">Or pass on a buy</div>}
            <button className="str-btn" onClick={() => dispatch({ type: "endTurn" } as StarRealmsDuelAction)}>End Turn</button>
          </div>
        </>
      )}
    </div>
  );
}
