import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WingspanOceaniaDraftState, WingspanOceaniaDraftAction, WingspanOceaniaDraftSettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, suitName, rankName, SUIT_NAMES } from "./state.js";
import "./Game.css";

export function WingspanOceaniaDraftGame({ state, dispatch, onGameOver }: GameProps<WingspanOceaniaDraftState, WingspanOceaniaDraftSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const finalScore = score(state);
  return (
    <div className="wso-wrap">
      <h3 className="wso-title">Wingspan: Oceania</h3>
      <div className="wso-stats">
        <div className="wso-stat"><span>Round</span><b>{state.round}/8</b></div>
        <div className="wso-stat"><span>You</span><b>{state.myScore}</b></div>
        <div className="wso-stat"><span>CPU</span><b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="wso-prompt">Pick one of 4 cards. CPU takes the highest remaining.</div>
          <div className="wso-offer">
            {state.offer.map((c, i) => (
              <button key={c.id + ":" + i} className={"wso-card wso-suit-" + c.suit} onClick={() => dispatch({ type: "pick", idx: i } as WingspanOceaniaDraftAction)}>
                <div className="wso-rank">{rankName(c.rank)}</div>
                <div className="wso-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="wso-event">
          <div className="wso-event-line">{state.lastEvent}</div>
          <button className="wso-next" onClick={() => dispatch({ type: "next" } as WingspanOceaniaDraftAction)}>Next Round &raquo;</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="wso-done">
          <h3>{state.myScore > state.cpuScore ? "Victory!" : state.myScore === state.cpuScore ? "Draw" : "Defeat"}</h3>
          <div className="wso-final">You: {state.myScore} &middot; CPU: {state.cpuScore}</div>
          <div className="wso-final-score">Final score: <b>{finalScore}</b></div>
        </div>
      )}
      <div className="wso-tableaus">
        <div className="wso-tab">
          <div className="wso-tab-label">Your tableau</div>
          <div className="wso-tab-row">
            {state.myTableau.map((c, i) => (
              <div key={i} className={"wso-mini wso-suit-" + c.suit}>
                <span className="wso-mini-rank">{rankName(c.rank)}</span>
                <span className="wso-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.myTableau.length === 0 && <div className="wso-empty">(none yet)</div>}
          </div>
        </div>
        <div className="wso-tab">
          <div className="wso-tab-label">CPU tableau</div>
          <div className="wso-tab-row">
            {state.cpuTableau.map((c, i) => (
              <div key={i} className={"wso-mini wso-suit-" + c.suit}>
                <span className="wso-mini-rank">{rankName(c.rank)}</span>
                <span className="wso-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.cpuTableau.length === 0 && <div className="wso-empty">(none yet)</div>}
          </div>
        </div>
      </div>
      <div className="wso-legend">
        Suits: {SUIT_NAMES.map((n, i) => <span key={i} className={"wso-leg wso-suit-" + i}>{n}</span>)}
        <span className="wso-rule">3 same suit +10 &middot; 5 same suit +20 &middot; pair +5 &middot; trip +12</span>
      </div>
    </div>
  );
}
