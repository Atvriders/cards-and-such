import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DominionDeckState, DominionDeckAction, DominionDeckSettings } from "./state.js";
import { isTerminal, TOTAL_TURNS, SHOP, cardById, totalScore } from "./state.js";
import "./Game.css";

export function DominionDeckGame({ state, dispatch, onGameOver }: GameProps<DominionDeckState, DominionDeckSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    const score = totalScore(state);
    return (
      <div className="dom-wrap">
        <div className="dom-done">
          <h2>Kingdom Tallied</h2>
          <div className="dom-stats">{score} victory points · deck size {state.deck.length + state.discard.length + state.hand.length + state.played.length}</div>
          <div className="dom-final">{score * 5} pts</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dom-wrap">
      <div className="dom-header">
        <span className="dom-progress">Turn {state.turn} / {TOTAL_TURNS}</span>
        <span className="dom-coin">{state.coin} coin</span>
        <span className="dom-vp">{state.vpTotal} VP</span>
      </div>
      <div className="dom-section-label">Hand</div>
      <div className="dom-row">
        {state.phase === "play" && state.hand.map((id, i) => {
          const c = cardById(id);
          return <div key={i} className={`dom-card ${c.kind}`}><div className="dom-name">{c.name}</div><div className="dom-stats-line">{c.coin > 0 ? `+${c.coin}c` : c.vp > 0 ? `+${c.vp}VP` : ""}</div></div>;
        })}
        {state.phase !== "play" && state.played.map((id, i) => {
          const c = cardById(id);
          return <div key={i} className={`dom-card ${c.kind} played`}><div className="dom-name">{c.name}</div><div className="dom-stats-line">{c.coin > 0 ? `+${c.coin}c` : c.vp > 0 ? `+${c.vp}VP` : ""}</div></div>;
        })}
      </div>
      {state.phase === "play" && (
        <button className="dom-btn primary" onClick={() => dispatch({ type: "playAll" } as DominionDeckAction)}>Play All Treasures</button>
      )}
      {state.phase === "buy" && (
        <>
          <div className="dom-section-label">Shop &middot; pick one to buy</div>
          <div className="dom-shop">
            {SHOP.filter(c => c.kind !== "starter").map(c => {
              const can = state.coin >= c.cost && !state.bought;
              return (
                <button key={c.id} className={`dom-shopcard ${c.kind}${can ? "" : " locked"}${state.bought === c.id ? " bought" : ""}`} disabled={!can} onClick={() => dispatch({ type: "buy", cardId: c.id } as DominionDeckAction)}>
                  <div className="dom-name">{c.name}</div>
                  <div className="dom-cost">{c.cost}c</div>
                  <div className="dom-stats-line">{c.coin > 0 ? `+${c.coin}c` : `+${c.vp}VP`}</div>
                </button>
              );
            })}
          </div>
          <div className="dom-actions">
            {state.bought ? (
              <div className="dom-feedback">Bought {cardById(state.bought).name}</div>
            ) : (
              <div className="dom-feedback">Or pass on a buy</div>
            )}
            <button className="dom-btn" onClick={() => dispatch({ type: "endTurn" } as DominionDeckAction)}>End Turn</button>
          </div>
        </>
      )}
    </div>
  );
}
