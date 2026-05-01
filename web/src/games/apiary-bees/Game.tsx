import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ApiaryBeesState, ApiaryBeesAction, ApiaryBeesSettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, suitName, rankName, SUIT_NAMES } from "./state.js";
import "./Game.css";

export function ApiaryBeesGame({ state, dispatch, onGameOver }: GameProps<ApiaryBeesState, ApiaryBeesSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const finalScore = score(state);
  return (
    <div className="apb-wrap">
      <h3 className="apb-title">Apiary: Bees</h3>
      <div className="apb-stats">
        <div className="apb-stat"><span>Round</span><b>{state.round}/9</b></div>
        <div className="apb-stat"><span>You</span><b>{state.myScore}</b></div>
        <div className="apb-stat"><span>CPU</span><b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="apb-prompt">Pick one of 4 cards. CPU takes the highest remaining.</div>
          <div className="apb-offer">
            {state.offer.map((c, i) => (
              <button key={c.id + ":" + i} className={"apb-card apb-suit-" + c.suit} onClick={() => dispatch({ type: "pick", idx: i } as ApiaryBeesAction)}>
                <div className="apb-rank">{rankName(c.rank)}</div>
                <div className="apb-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="apb-event">
          <div className="apb-event-line">{state.lastEvent}</div>
          <button className="apb-next" onClick={() => dispatch({ type: "next" } as ApiaryBeesAction)}>Next Round &raquo;</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="apb-done">
          <h3>{state.myScore > state.cpuScore ? "Victory!" : state.myScore === state.cpuScore ? "Draw" : "Defeat"}</h3>
          <div className="apb-final">You: {state.myScore} &middot; CPU: {state.cpuScore}</div>
          <div className="apb-final-score">Final score: <b>{finalScore}</b></div>
        </div>
      )}
      <div className="apb-tableaus">
        <div className="apb-tab">
          <div className="apb-tab-label">Your tableau</div>
          <div className="apb-tab-row">
            {state.myTableau.map((c, i) => (
              <div key={i} className={"apb-mini apb-suit-" + c.suit}>
                <span className="apb-mini-rank">{rankName(c.rank)}</span>
                <span className="apb-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.myTableau.length === 0 && <div className="apb-empty">(none yet)</div>}
          </div>
        </div>
        <div className="apb-tab">
          <div className="apb-tab-label">CPU tableau</div>
          <div className="apb-tab-row">
            {state.cpuTableau.map((c, i) => (
              <div key={i} className={"apb-mini apb-suit-" + c.suit}>
                <span className="apb-mini-rank">{rankName(c.rank)}</span>
                <span className="apb-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.cpuTableau.length === 0 && <div className="apb-empty">(none yet)</div>}
          </div>
        </div>
      </div>
      <div className="apb-legend">
        Suits: {SUIT_NAMES.map((n, i) => <span key={i} className={"apb-leg apb-suit-" + i}>{n}</span>)}
        <span className="apb-rule">3 same suit +10 &middot; 5 same suit +20 &middot; pair +5 &middot; trip +12</span>
      </div>
    </div>
  );
}
