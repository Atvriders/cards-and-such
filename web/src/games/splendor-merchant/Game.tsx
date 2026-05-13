import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SplendorMerchantState, SplendorMerchantAction, SplendorMerchantSettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, suitName, rankName, SUIT_NAMES } from "./state.js";
import "./Game.css";

export function SplendorMerchantGame({ state, dispatch, onGameOver }: GameProps<SplendorMerchantState, SplendorMerchantSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const finalScore = score(state);
  return (
    <div className="spmm-wrap fade-in">
      <h3 className="spmm-title">Splendor: Merchant</h3>
      <div className="spmm-stats">
        <div className="spmm-stat"><span>Round</span><b>{state.round}/9</b></div>
        <div className="spmm-stat"><span>You</span><b>{state.myScore}</b></div>
        <div className="spmm-stat"><span>CPU</span><b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="spmm-prompt">Pick one of 4 cards. CPU takes the highest remaining.</div>
          <div className="spmm-offer">
            {state.offer.map((c, i) => (
              <button key={c.id + ":" + i} className={"spmm-card spmm-suit-" + c.suit} onClick={() => dispatch({ type: "pick", idx: i } as SplendorMerchantAction)}>
                <div className="spmm-rank">{rankName(c.rank)}</div>
                <div className="spmm-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="spmm-event">
          <div className="spmm-event-line">{state.lastEvent}</div>
          <button className="spmm-next" onClick={() => dispatch({ type: "next" } as SplendorMerchantAction)}>Next Round &raquo;</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="spmm-done bounce-in">
          <h3>{state.myScore > state.cpuScore ? "Victory!" : state.myScore === state.cpuScore ? "Draw" : "Defeat"}</h3>
          <div className="spmm-final">You: {state.myScore} &middot; CPU: {state.cpuScore}</div>
          <div className="spmm-final-score pulse">Final score: <b>{finalScore}</b></div>
        </div>
      )}
      <div className="spmm-tableaus">
        <div className="spmm-tab">
          <div className="spmm-tab-label">Your tableau</div>
          <div className="spmm-tab-row">
            {state.myTableau.map((c, i) => (
              <div key={i} className={"spmm-mini spmm-suit-" + c.suit}>
                <span className="spmm-mini-rank">{rankName(c.rank)}</span>
                <span className="spmm-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.myTableau.length === 0 && <div className="spmm-empty">(none yet)</div>}
          </div>
        </div>
        <div className="spmm-tab">
          <div className="spmm-tab-label">CPU tableau</div>
          <div className="spmm-tab-row">
            {state.cpuTableau.map((c, i) => (
              <div key={i} className={"spmm-mini spmm-suit-" + c.suit}>
                <span className="spmm-mini-rank">{rankName(c.rank)}</span>
                <span className="spmm-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.cpuTableau.length === 0 && <div className="spmm-empty">(none yet)</div>}
          </div>
        </div>
      </div>
      <div className="spmm-legend">
        Suits: {SUIT_NAMES.map((n, i) => <span key={i} className={"spmm-leg spmm-suit-" + i}>{n}</span>)}
        <span className="spmm-rule">3 same suit +10 &middot; 5 same suit +20 &middot; pair +5 &middot; trip +12</span>
      </div>
    </div>
  );
}
