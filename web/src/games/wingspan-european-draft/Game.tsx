import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WingspanEuropeanDraftState, WingspanEuropeanDraftAction, WingspanEuropeanDraftSettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, suitName, rankName, SUIT_NAMES } from "./state.js";
import "./Game.css";

export function WingspanEuropeanDraftGame({ state, dispatch, onGameOver }: GameProps<WingspanEuropeanDraftState, WingspanEuropeanDraftSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const finalScore = score(state);
  return (
    <div className="wse-wrap">
      <h3 className="wse-title">Wingspan: European</h3>
      <div className="wse-stats">
        <div className="wse-stat"><span>Round</span><b>{state.round}/8</b></div>
        <div className="wse-stat"><span>You</span><b>{state.myScore}</b></div>
        <div className="wse-stat"><span>CPU</span><b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="wse-prompt">Pick one of 4 cards. CPU takes the highest remaining.</div>
          <div className="wse-offer">
            {state.offer.map((c, i) => (
              <button key={c.id + ":" + i} className={"wse-card wse-suit-" + c.suit} onClick={() => dispatch({ type: "pick", idx: i } as WingspanEuropeanDraftAction)}>
                <div className="wse-rank">{rankName(c.rank)}</div>
                <div className="wse-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="wse-event">
          <div className="wse-event-line">{state.lastEvent}</div>
          <button className="wse-next" onClick={() => dispatch({ type: "next" } as WingspanEuropeanDraftAction)}>Next Round &raquo;</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="wse-done">
          <h3>{state.myScore > state.cpuScore ? "Victory!" : state.myScore === state.cpuScore ? "Draw" : "Defeat"}</h3>
          <div className="wse-final">You: {state.myScore} &middot; CPU: {state.cpuScore}</div>
          <div className="wse-final-score">Final score: <b>{finalScore}</b></div>
        </div>
      )}
      <div className="wse-tableaus">
        <div className="wse-tab">
          <div className="wse-tab-label">Your tableau</div>
          <div className="wse-tab-row">
            {state.myTableau.map((c, i) => (
              <div key={i} className={"wse-mini wse-suit-" + c.suit}>
                <span className="wse-mini-rank">{rankName(c.rank)}</span>
                <span className="wse-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.myTableau.length === 0 && <div className="wse-empty">(none yet)</div>}
          </div>
        </div>
        <div className="wse-tab">
          <div className="wse-tab-label">CPU tableau</div>
          <div className="wse-tab-row">
            {state.cpuTableau.map((c, i) => (
              <div key={i} className={"wse-mini wse-suit-" + c.suit}>
                <span className="wse-mini-rank">{rankName(c.rank)}</span>
                <span className="wse-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.cpuTableau.length === 0 && <div className="wse-empty">(none yet)</div>}
          </div>
        </div>
      </div>
      <div className="wse-legend">
        Suits: {SUIT_NAMES.map((n, i) => <span key={i} className={"wse-leg wse-suit-" + i}>{n}</span>)}
        <span className="wse-rule">3 same suit +10 &middot; 5 same suit +20 &middot; pair +5 &middot; trip +12</span>
      </div>
    </div>
  );
}
