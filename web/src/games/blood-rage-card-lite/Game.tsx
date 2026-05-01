import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BloodRageCardLiteState, BloodRageCardLiteAction, BloodRageCardLiteSettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, suitName, rankName, SUIT_NAMES } from "./state.js";
import "./Game.css";

export function BloodRageCardLiteGame({ state, dispatch, onGameOver }: GameProps<BloodRageCardLiteState, BloodRageCardLiteSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const finalScore = score(state);
  return (
    <div className="brcl-wrap">
      <h3 className="brcl-title">Blood Rage: Lite</h3>
      <div className="brcl-stats">
        <div className="brcl-stat"><span>Round</span><b>{state.round}/8</b></div>
        <div className="brcl-stat"><span>You</span><b>{state.myScore}</b></div>
        <div className="brcl-stat"><span>CPU</span><b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="brcl-prompt">Pick one of 4 cards. CPU takes the highest remaining.</div>
          <div className="brcl-offer">
            {state.offer.map((c, i) => (
              <button key={c.id + ":" + i} className={"brcl-card brcl-suit-" + c.suit} onClick={() => dispatch({ type: "pick", idx: i } as BloodRageCardLiteAction)}>
                <div className="brcl-rank">{rankName(c.rank)}</div>
                <div className="brcl-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="brcl-event">
          <div className="brcl-event-line">{state.lastEvent}</div>
          <button className="brcl-next" onClick={() => dispatch({ type: "next" } as BloodRageCardLiteAction)}>Next Round &raquo;</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="brcl-done">
          <h3>{state.myScore > state.cpuScore ? "Victory!" : state.myScore === state.cpuScore ? "Draw" : "Defeat"}</h3>
          <div className="brcl-final">You: {state.myScore} &middot; CPU: {state.cpuScore}</div>
          <div className="brcl-final-score">Final score: <b>{finalScore}</b></div>
        </div>
      )}
      <div className="brcl-tableaus">
        <div className="brcl-tab">
          <div className="brcl-tab-label">Your tableau</div>
          <div className="brcl-tab-row">
            {state.myTableau.map((c, i) => (
              <div key={i} className={"brcl-mini brcl-suit-" + c.suit}>
                <span className="brcl-mini-rank">{rankName(c.rank)}</span>
                <span className="brcl-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.myTableau.length === 0 && <div className="brcl-empty">(none yet)</div>}
          </div>
        </div>
        <div className="brcl-tab">
          <div className="brcl-tab-label">CPU tableau</div>
          <div className="brcl-tab-row">
            {state.cpuTableau.map((c, i) => (
              <div key={i} className={"brcl-mini brcl-suit-" + c.suit}>
                <span className="brcl-mini-rank">{rankName(c.rank)}</span>
                <span className="brcl-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.cpuTableau.length === 0 && <div className="brcl-empty">(none yet)</div>}
          </div>
        </div>
      </div>
      <div className="brcl-legend">
        Suits: {SUIT_NAMES.map((n, i) => <span key={i} className={"brcl-leg brcl-suit-" + i}>{n}</span>)}
        <span className="brcl-rule">3 same suit +10 &middot; 5 same suit +20 &middot; pair +5 &middot; trip +12</span>
      </div>
    </div>
  );
}
