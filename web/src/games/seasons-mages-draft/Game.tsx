import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SeasonsMagesDraftState, SeasonsMagesDraftAction, SeasonsMagesDraftSettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, suitName, rankName, SUIT_NAMES } from "./state.js";
import "./Game.css";

export function SeasonsMagesDraftGame({ state, dispatch, onGameOver }: GameProps<SeasonsMagesDraftState, SeasonsMagesDraftSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const finalScore = score(state);
  return (
    <div className="smd-wrap">
      <h3 className="smd-title">Seasons: Mages</h3>
      <div className="smd-stats">
        <div className="smd-stat"><span>Round</span><b>{state.round}/9</b></div>
        <div className="smd-stat"><span>You</span><b>{state.myScore}</b></div>
        <div className="smd-stat"><span>CPU</span><b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="smd-prompt">Pick one of 4 cards. CPU takes the highest remaining.</div>
          <div className="smd-offer">
            {state.offer.map((c, i) => (
              <button key={c.id + ":" + i} className={"smd-card smd-suit-" + c.suit} onClick={() => dispatch({ type: "pick", idx: i } as SeasonsMagesDraftAction)}>
                <div className="smd-rank">{rankName(c.rank)}</div>
                <div className="smd-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="smd-event">
          <div className="smd-event-line">{state.lastEvent}</div>
          <button className="smd-next" onClick={() => dispatch({ type: "next" } as SeasonsMagesDraftAction)}>Next Round &raquo;</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="smd-done">
          <h3>{state.myScore > state.cpuScore ? "Victory!" : state.myScore === state.cpuScore ? "Draw" : "Defeat"}</h3>
          <div className="smd-final">You: {state.myScore} &middot; CPU: {state.cpuScore}</div>
          <div className="smd-final-score">Final score: <b>{finalScore}</b></div>
        </div>
      )}
      <div className="smd-tableaus">
        <div className="smd-tab">
          <div className="smd-tab-label">Your tableau</div>
          <div className="smd-tab-row">
            {state.myTableau.map((c, i) => (
              <div key={i} className={"smd-mini smd-suit-" + c.suit}>
                <span className="smd-mini-rank">{rankName(c.rank)}</span>
                <span className="smd-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.myTableau.length === 0 && <div className="smd-empty">(none yet)</div>}
          </div>
        </div>
        <div className="smd-tab">
          <div className="smd-tab-label">CPU tableau</div>
          <div className="smd-tab-row">
            {state.cpuTableau.map((c, i) => (
              <div key={i} className={"smd-mini smd-suit-" + c.suit}>
                <span className="smd-mini-rank">{rankName(c.rank)}</span>
                <span className="smd-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.cpuTableau.length === 0 && <div className="smd-empty">(none yet)</div>}
          </div>
        </div>
      </div>
      <div className="smd-legend">
        Suits: {SUIT_NAMES.map((n, i) => <span key={i} className={"smd-leg smd-suit-" + i}>{n}</span>)}
        <span className="smd-rule">3 same suit +10 &middot; 5 same suit +20 &middot; pair +5 &middot; trip +12</span>
      </div>
    </div>
  );
}
