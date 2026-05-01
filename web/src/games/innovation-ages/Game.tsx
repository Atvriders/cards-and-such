import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { InnovationAgesState, InnovationAgesAction, InnovationAgesSettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, suitName, rankName, SUIT_NAMES } from "./state.js";
import "./Game.css";

export function InnovationAgesGame({ state, dispatch, onGameOver }: GameProps<InnovationAgesState, InnovationAgesSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const finalScore = score(state);
  return (
    <div className="iva-wrap">
      <h3 className="iva-title">Innovation: Ages</h3>
      <div className="iva-stats">
        <div className="iva-stat"><span>Round</span><b>{state.round}/10</b></div>
        <div className="iva-stat"><span>You</span><b>{state.myScore}</b></div>
        <div className="iva-stat"><span>CPU</span><b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="iva-prompt">Pick one of 3 cards. CPU takes the highest remaining.</div>
          <div className="iva-offer">
            {state.offer.map((c, i) => (
              <button key={c.id + ":" + i} className={"iva-card iva-suit-" + c.suit} onClick={() => dispatch({ type: "pick", idx: i } as InnovationAgesAction)}>
                <div className="iva-rank">{rankName(c.rank)}</div>
                <div className="iva-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="iva-event">
          <div className="iva-event-line">{state.lastEvent}</div>
          <button className="iva-next" onClick={() => dispatch({ type: "next" } as InnovationAgesAction)}>Next Round &raquo;</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="iva-done">
          <h3>{state.myScore > state.cpuScore ? "Victory!" : state.myScore === state.cpuScore ? "Draw" : "Defeat"}</h3>
          <div className="iva-final">You: {state.myScore} &middot; CPU: {state.cpuScore}</div>
          <div className="iva-final-score">Final score: <b>{finalScore}</b></div>
        </div>
      )}
      <div className="iva-tableaus">
        <div className="iva-tab">
          <div className="iva-tab-label">Your tableau</div>
          <div className="iva-tab-row">
            {state.myTableau.map((c, i) => (
              <div key={i} className={"iva-mini iva-suit-" + c.suit}>
                <span className="iva-mini-rank">{rankName(c.rank)}</span>
                <span className="iva-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.myTableau.length === 0 && <div className="iva-empty">(none yet)</div>}
          </div>
        </div>
        <div className="iva-tab">
          <div className="iva-tab-label">CPU tableau</div>
          <div className="iva-tab-row">
            {state.cpuTableau.map((c, i) => (
              <div key={i} className={"iva-mini iva-suit-" + c.suit}>
                <span className="iva-mini-rank">{rankName(c.rank)}</span>
                <span className="iva-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.cpuTableau.length === 0 && <div className="iva-empty">(none yet)</div>}
          </div>
        </div>
      </div>
      <div className="iva-legend">
        Suits: {SUIT_NAMES.map((n, i) => <span key={i} className={"iva-leg iva-suit-" + i}>{n}</span>)}
        <span className="iva-rule">3 same suit +10 &middot; 5 same suit +20 &middot; pair +5 &middot; trip +12</span>
      </div>
    </div>
  );
}
