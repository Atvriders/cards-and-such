import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FairyTaleDraftState, FairyTaleDraftAction, FairyTaleDraftSettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, suitName, rankName, SUIT_NAMES } from "./state.js";
import "./Game.css";

export function FairyTaleDraftGame({ state, dispatch, onGameOver }: GameProps<FairyTaleDraftState, FairyTaleDraftSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const finalScore = score(state);
  return (
    <div className="ftd-wrap">
      <h3 className="ftd-title">Fairy Tale Draft</h3>
      <div className="ftd-stats">
        <div className="ftd-stat"><span>Round</span><b>{state.round}/8</b></div>
        <div className="ftd-stat"><span>You</span><b>{state.myScore}</b></div>
        <div className="ftd-stat"><span>CPU</span><b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="ftd-prompt">Pick one of 4 cards. CPU takes the highest remaining.</div>
          <div className="ftd-offer">
            {state.offer.map((c, i) => (
              <button key={c.id + ":" + i} className={"ftd-card ftd-suit-" + c.suit} onClick={() => dispatch({ type: "pick", idx: i } as FairyTaleDraftAction)}>
                <div className="ftd-rank">{rankName(c.rank)}</div>
                <div className="ftd-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="ftd-event">
          <div className="ftd-event-line">{state.lastEvent}</div>
          <button className="ftd-next" onClick={() => dispatch({ type: "next" } as FairyTaleDraftAction)}>Next Round &raquo;</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="ftd-done">
          <h3>{state.myScore > state.cpuScore ? "Victory!" : state.myScore === state.cpuScore ? "Draw" : "Defeat"}</h3>
          <div className="ftd-final">You: {state.myScore} &middot; CPU: {state.cpuScore}</div>
          <div className="ftd-final-score">Final score: <b>{finalScore}</b></div>
        </div>
      )}
      <div className="ftd-tableaus">
        <div className="ftd-tab">
          <div className="ftd-tab-label">Your tableau</div>
          <div className="ftd-tab-row">
            {state.myTableau.map((c, i) => (
              <div key={i} className={"ftd-mini ftd-suit-" + c.suit}>
                <span className="ftd-mini-rank">{rankName(c.rank)}</span>
                <span className="ftd-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.myTableau.length === 0 && <div className="ftd-empty">(none yet)</div>}
          </div>
        </div>
        <div className="ftd-tab">
          <div className="ftd-tab-label">CPU tableau</div>
          <div className="ftd-tab-row">
            {state.cpuTableau.map((c, i) => (
              <div key={i} className={"ftd-mini ftd-suit-" + c.suit}>
                <span className="ftd-mini-rank">{rankName(c.rank)}</span>
                <span className="ftd-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.cpuTableau.length === 0 && <div className="ftd-empty">(none yet)</div>}
          </div>
        </div>
      </div>
      <div className="ftd-legend">
        Suits: {SUIT_NAMES.map((n, i) => <span key={i} className={"ftd-leg ftd-suit-" + i}>{n}</span>)}
        <span className="ftd-rule">3 same suit +10 &middot; 5 same suit +20 &middot; pair +5 &middot; trip +12</span>
      </div>
    </div>
  );
}
