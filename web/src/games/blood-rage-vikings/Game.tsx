import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BloodRageVikingsState, BloodRageVikingsAction, BloodRageVikingsSettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, suitName, rankName, SUIT_NAMES } from "./state.js";
import "./Game.css";

export function BloodRageVikingsGame({ state, dispatch, onGameOver }: GameProps<BloodRageVikingsState, BloodRageVikingsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const finalScore = score(state);
  return (
    <div className="brv-wrap">
      <h3 className="brv-title">Blood Rage: Vikings</h3>
      <div className="brv-stats">
        <div className="brv-stat"><span>Round</span><b>{state.round}/9</b></div>
        <div className="brv-stat"><span>You</span><b>{state.myScore}</b></div>
        <div className="brv-stat"><span>CPU</span><b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="brv-prompt">Pick one of 4 cards. CPU takes the highest remaining.</div>
          <div className="brv-offer">
            {state.offer.map((c, i) => (
              <button key={c.id + ":" + i} className={"brv-card brv-suit-" + c.suit} onClick={() => dispatch({ type: "pick", idx: i } as BloodRageVikingsAction)}>
                <div className="brv-rank">{rankName(c.rank)}</div>
                <div className="brv-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="brv-event">
          <div className="brv-event-line">{state.lastEvent}</div>
          <button className="brv-next" onClick={() => dispatch({ type: "next" } as BloodRageVikingsAction)}>Next Round &raquo;</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="brv-done">
          <h3>{state.myScore > state.cpuScore ? "Victory!" : state.myScore === state.cpuScore ? "Draw" : "Defeat"}</h3>
          <div className="brv-final">You: {state.myScore} &middot; CPU: {state.cpuScore}</div>
          <div className="brv-final-score">Final score: <b>{finalScore}</b></div>
        </div>
      )}
      <div className="brv-tableaus">
        <div className="brv-tab">
          <div className="brv-tab-label">Your tableau</div>
          <div className="brv-tab-row">
            {state.myTableau.map((c, i) => (
              <div key={i} className={"brv-mini brv-suit-" + c.suit}>
                <span className="brv-mini-rank">{rankName(c.rank)}</span>
                <span className="brv-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.myTableau.length === 0 && <div className="brv-empty">(none yet)</div>}
          </div>
        </div>
        <div className="brv-tab">
          <div className="brv-tab-label">CPU tableau</div>
          <div className="brv-tab-row">
            {state.cpuTableau.map((c, i) => (
              <div key={i} className={"brv-mini brv-suit-" + c.suit}>
                <span className="brv-mini-rank">{rankName(c.rank)}</span>
                <span className="brv-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.cpuTableau.length === 0 && <div className="brv-empty">(none yet)</div>}
          </div>
        </div>
      </div>
      <div className="brv-legend">
        Suits: {SUIT_NAMES.map((n, i) => <span key={i} className={"brv-leg brv-suit-" + i}>{n}</span>)}
        <span className="brv-rule">3 same suit +10 &middot; 5 same suit +20 &middot; pair +5 &middot; trip +12</span>
      </div>
    </div>
  );
}
