import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SplendorTradeRoutesState, SplendorTradeRoutesAction, SplendorTradeRoutesSettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, suitName, rankName, SUIT_NAMES } from "./state.js";
import "./Game.css";

export function SplendorTradeRoutesGame({ state, dispatch, onGameOver }: GameProps<SplendorTradeRoutesState, SplendorTradeRoutesSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const finalScore = score(state);
  return (
    <div className="spt-wrap">
      <h3 className="spt-title">Splendor: Trade Routes</h3>
      <div className="spt-stats">
        <div className="spt-stat"><span>Round</span><b>{state.round}/8</b></div>
        <div className="spt-stat"><span>You</span><b>{state.myScore}</b></div>
        <div className="spt-stat"><span>CPU</span><b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="spt-prompt">Pick one of 4 cards. CPU takes the highest remaining.</div>
          <div className="spt-offer">
            {state.offer.map((c, i) => (
              <button key={c.id + ":" + i} className={"spt-card spt-suit-" + c.suit} onClick={() => dispatch({ type: "pick", idx: i } as SplendorTradeRoutesAction)}>
                <div className="spt-rank">{rankName(c.rank)}</div>
                <div className="spt-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="spt-event">
          <div className="spt-event-line">{state.lastEvent}</div>
          <button className="spt-next" onClick={() => dispatch({ type: "next" } as SplendorTradeRoutesAction)}>Next Round &raquo;</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="spt-done">
          <h3>{state.myScore > state.cpuScore ? "Victory!" : state.myScore === state.cpuScore ? "Draw" : "Defeat"}</h3>
          <div className="spt-final">You: {state.myScore} &middot; CPU: {state.cpuScore}</div>
          <div className="spt-final-score">Final score: <b>{finalScore}</b></div>
        </div>
      )}
      <div className="spt-tableaus">
        <div className="spt-tab">
          <div className="spt-tab-label">Your tableau</div>
          <div className="spt-tab-row">
            {state.myTableau.map((c, i) => (
              <div key={i} className={"spt-mini spt-suit-" + c.suit}>
                <span className="spt-mini-rank">{rankName(c.rank)}</span>
                <span className="spt-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.myTableau.length === 0 && <div className="spt-empty">(none yet)</div>}
          </div>
        </div>
        <div className="spt-tab">
          <div className="spt-tab-label">CPU tableau</div>
          <div className="spt-tab-row">
            {state.cpuTableau.map((c, i) => (
              <div key={i} className={"spt-mini spt-suit-" + c.suit}>
                <span className="spt-mini-rank">{rankName(c.rank)}</span>
                <span className="spt-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.cpuTableau.length === 0 && <div className="spt-empty">(none yet)</div>}
          </div>
        </div>
      </div>
      <div className="spt-legend">
        Suits: {SUIT_NAMES.map((n, i) => <span key={i} className={"spt-leg spt-suit-" + i}>{n}</span>)}
        <span className="spt-rule">3 same suit +10 &middot; 5 same suit +20 &middot; pair +5 &middot; trip +12</span>
      </div>
    </div>
  );
}
