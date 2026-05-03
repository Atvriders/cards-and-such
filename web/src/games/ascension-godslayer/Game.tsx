import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AscensionGodslayerState, AscensionGodslayerAction, AscensionGodslayerSettings } from "./state.js";
import { isTerminal, TOTAL_TURNS, SHOP, cardById, totalScore } from "./state.js";
import "./Game.css";

export function AscensionGodslayerGame({ state, dispatch, onGameOver }: GameProps<AscensionGodslayerState, AscensionGodslayerSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    const score = totalScore(state);
    return (
      <div className="asc-wrap">
        <div className="asc-done">
          <h2>Tallied</h2>
          <div className="asc-stats">{score} VP &middot; {state.deck.length + state.discard.length + state.hand.length + state.played.length} cards in deck</div>
          <div className="asc-final">{score * 5} pts</div>
        </div>
      </div>
    );
  }

  return (
    <div className="asc-wrap">
      <div className="asc-header">
        <span className="asc-progress">Turn {state.turn} / {TOTAL_TURNS}</span>
        <span className="asc-coin">{state.coin} coin</span>
        <span className="asc-vp">{state.vpTotal} VP</span>
      </div>
      <div className="asc-section-label">Hand</div>
      <div className="asc-row">
        {state.phase === "play" && state.hand.map((id, i) => {
          const c = cardById(id);
          return <div key={i} className={`asc-card ${c.kind}`}><div className="asc-name">{c.name}</div><div className="asc-stats-line">{c.coin > 0 ? `+${c.coin}c` : c.vp > 0 ? `+${c.vp}VP` : ""}</div></div>;
        })}
        {state.phase !== "play" && state.played.map((id, i) => {
          const c = cardById(id);
          return <div key={i} className={`asc-card ${c.kind} played`}><div className="asc-name">{c.name}</div><div className="asc-stats-line">{c.coin > 0 ? `+${c.coin}c` : c.vp > 0 ? `+${c.vp}VP` : ""}</div></div>;
        })}
      </div>
      {state.phase === "play" && (
        <button data-testid="hint-target-ascension-godslayer-primary" className="asc-btn primary" onClick={() => dispatch({ type: "playAll" } as AscensionGodslayerAction)}>Play All</button>
      )}
      {state.phase === "buy" && (
        <>
          <div className="asc-section-label">Shop &middot; pick one to buy</div>
          <div className="asc-shop">
            {SHOP.filter(c => c.kind !== "starter").map(c => {
              const can = state.coin >= c.cost && !state.bought;
              return (
                <button key={c.id} className={`asc-shopcard ${c.kind}${can ? "" : " locked"}${state.bought === c.id ? " bought" : ""}`} disabled={!can} onClick={() => dispatch({ type: "buy", cardId: c.id } as AscensionGodslayerAction)}>
                  <div className="asc-name">{c.name}</div>
                  <div className="asc-cost">{c.cost}c</div>
                  <div className="asc-stats-line">{c.coin > 0 ? `+${c.coin}c` : `+${c.vp}VP`}</div>
                </button>
              );
            })}
          </div>
          <div className="asc-actions">
            {state.bought ? <div className="asc-feedback">Bought {cardById(state.bought).name}</div> : <div className="asc-feedback">Or pass on a buy</div>}
            <button className="asc-btn" onClick={() => dispatch({ type: "endTurn" } as AscensionGodslayerAction)}>End Turn</button>
          </div>
        </>
      )}
    </div>
  );
}
