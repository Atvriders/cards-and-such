import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HeroRealmsQuestState, HeroRealmsQuestAction, HeroRealmsQuestSettings } from "./state.js";
import { isTerminal, TOTAL_TURNS, SHOP, cardById, totalScore } from "./state.js";
import "./Game.css";

export function HeroRealmsQuestGame({ state, dispatch, onGameOver }: GameProps<HeroRealmsQuestState, HeroRealmsQuestSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    const score = totalScore(state);
    return (
      <div className="hrh-wrap">
        <div className="hrh-done">
          <h2>Tallied</h2>
          <div className="hrh-stats">{score} VP &middot; {state.deck.length + state.discard.length + state.hand.length + state.played.length} cards in deck</div>
          <div className="hrh-final">{score * 5} pts</div>
        </div>
      </div>
    );
  }

  return (
    <div className="hrh-wrap">
      <div className="hrh-header">
        <span className="hrh-progress">Turn {state.turn} / {TOTAL_TURNS}</span>
        <span className="hrh-coin">{state.coin} coin</span>
        <span className="hrh-vp">{state.vpTotal} VP</span>
      </div>
      <div className="hrh-section-label">Hand</div>
      <div className="hrh-row">
        {state.phase === "play" && state.hand.map((id, i) => {
          const c = cardById(id);
          return <div key={i} className={`hrh-card ${c.kind}`}><div className="hrh-name">{c.name}</div><div className="hrh-stats-line">{c.coin > 0 ? `+${c.coin}c` : c.vp > 0 ? `+${c.vp}VP` : ""}</div></div>;
        })}
        {state.phase !== "play" && state.played.map((id, i) => {
          const c = cardById(id);
          return <div key={i} className={`hrh-card ${c.kind} played`}><div className="hrh-name">{c.name}</div><div className="hrh-stats-line">{c.coin > 0 ? `+${c.coin}c` : c.vp > 0 ? `+${c.vp}VP` : ""}</div></div>;
        })}
      </div>
      {state.phase === "play" && (
        <button className="hrh-btn primary" onClick={() => dispatch({ type: "playAll" } as HeroRealmsQuestAction)}>Play All</button>
      )}
      {state.phase === "buy" && (
        <>
          <div className="hrh-section-label">Shop &middot; pick one to buy</div>
          <div className="hrh-shop">
            {SHOP.filter(c => c.kind !== "starter").map(c => {
              const can = state.coin >= c.cost && !state.bought;
              return (
                <button key={c.id} className={`hrh-shopcard ${c.kind}${can ? "" : " locked"}${state.bought === c.id ? " bought" : ""}`} disabled={!can} onClick={() => dispatch({ type: "buy", cardId: c.id } as HeroRealmsQuestAction)}>
                  <div className="hrh-name">{c.name}</div>
                  <div className="hrh-cost">{c.cost}c</div>
                  <div className="hrh-stats-line">{c.coin > 0 ? `+${c.coin}c` : `+${c.vp}VP`}</div>
                </button>
              );
            })}
          </div>
          <div className="hrh-actions">
            {state.bought ? <div className="hrh-feedback">Bought {cardById(state.bought).name}</div> : <div className="hrh-feedback">Or pass on a buy</div>}
            <button className="hrh-btn" onClick={() => dispatch({ type: "endTurn" } as HeroRealmsQuestAction)}>End Turn</button>
          </div>
        </>
      )}
    </div>
  );
}
