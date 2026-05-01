import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PointSaladVegState, PointSaladVegAction, PointSaladVegSettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, suitName, rankName, SUIT_NAMES } from "./state.js";
import "./Game.css";

export function PointSaladVegGame({ state, dispatch, onGameOver }: GameProps<PointSaladVegState, PointSaladVegSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const finalScore = score(state);
  return (
    <div className="psv-wrap">
      <h3 className="psv-title">Point Salad</h3>
      <div className="psv-stats">
        <div className="psv-stat"><span>Round</span><b>{state.round}/9</b></div>
        <div className="psv-stat"><span>You</span><b>{state.myScore}</b></div>
        <div className="psv-stat"><span>CPU</span><b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="psv-prompt">Pick one of 4 cards. CPU takes the highest remaining.</div>
          <div className="psv-offer">
            {state.offer.map((c, i) => (
              <button key={c.id + ":" + i} className={"psv-card psv-suit-" + c.suit} onClick={() => dispatch({ type: "pick", idx: i } as PointSaladVegAction)}>
                <div className="psv-rank">{rankName(c.rank)}</div>
                <div className="psv-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="psv-event">
          <div className="psv-event-line">{state.lastEvent}</div>
          <button className="psv-next" onClick={() => dispatch({ type: "next" } as PointSaladVegAction)}>Next Round &raquo;</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="psv-done">
          <h3>{state.myScore > state.cpuScore ? "Victory!" : state.myScore === state.cpuScore ? "Draw" : "Defeat"}</h3>
          <div className="psv-final">You: {state.myScore} &middot; CPU: {state.cpuScore}</div>
          <div className="psv-final-score">Final score: <b>{finalScore}</b></div>
        </div>
      )}
      <div className="psv-tableaus">
        <div className="psv-tab">
          <div className="psv-tab-label">Your tableau</div>
          <div className="psv-tab-row">
            {state.myTableau.map((c, i) => (
              <div key={i} className={"psv-mini psv-suit-" + c.suit}>
                <span className="psv-mini-rank">{rankName(c.rank)}</span>
                <span className="psv-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.myTableau.length === 0 && <div className="psv-empty">(none yet)</div>}
          </div>
        </div>
        <div className="psv-tab">
          <div className="psv-tab-label">CPU tableau</div>
          <div className="psv-tab-row">
            {state.cpuTableau.map((c, i) => (
              <div key={i} className={"psv-mini psv-suit-" + c.suit}>
                <span className="psv-mini-rank">{rankName(c.rank)}</span>
                <span className="psv-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.cpuTableau.length === 0 && <div className="psv-empty">(none yet)</div>}
          </div>
        </div>
      </div>
      <div className="psv-legend">
        Suits: {SUIT_NAMES.map((n, i) => <span key={i} className={"psv-leg psv-suit-" + i}>{n}</span>)}
        <span className="psv-rule">3 same suit +10 &middot; 5 same suit +20 &middot; pair +5 &middot; trip +12</span>
      </div>
    </div>
  );
}
