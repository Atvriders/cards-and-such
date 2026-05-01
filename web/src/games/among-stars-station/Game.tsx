import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AmongStarsStationState, AmongStarsStationAction, AmongStarsStationSettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, suitName, rankName, SUIT_NAMES } from "./state.js";
import "./Game.css";

export function AmongStarsStationGame({ state, dispatch, onGameOver }: GameProps<AmongStarsStationState, AmongStarsStationSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const finalScore = score(state);
  return (
    <div className="ass-wrap">
      <h3 className="ass-title">Among the Stars: Station</h3>
      <div className="ass-stats">
        <div className="ass-stat"><span>Round</span><b>{state.round}/9</b></div>
        <div className="ass-stat"><span>You</span><b>{state.myScore}</b></div>
        <div className="ass-stat"><span>CPU</span><b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="ass-prompt">Pick one of 4 cards. CPU takes the highest remaining.</div>
          <div className="ass-offer">
            {state.offer.map((c, i) => (
              <button key={c.id + ":" + i} className={"ass-card ass-suit-" + c.suit} onClick={() => dispatch({ type: "pick", idx: i } as AmongStarsStationAction)}>
                <div className="ass-rank">{rankName(c.rank)}</div>
                <div className="ass-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="ass-event">
          <div className="ass-event-line">{state.lastEvent}</div>
          <button className="ass-next" onClick={() => dispatch({ type: "next" } as AmongStarsStationAction)}>Next Round &raquo;</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="ass-done">
          <h3>{state.myScore > state.cpuScore ? "Victory!" : state.myScore === state.cpuScore ? "Draw" : "Defeat"}</h3>
          <div className="ass-final">You: {state.myScore} &middot; CPU: {state.cpuScore}</div>
          <div className="ass-final-score">Final score: <b>{finalScore}</b></div>
        </div>
      )}
      <div className="ass-tableaus">
        <div className="ass-tab">
          <div className="ass-tab-label">Your tableau</div>
          <div className="ass-tab-row">
            {state.myTableau.map((c, i) => (
              <div key={i} className={"ass-mini ass-suit-" + c.suit}>
                <span className="ass-mini-rank">{rankName(c.rank)}</span>
                <span className="ass-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.myTableau.length === 0 && <div className="ass-empty">(none yet)</div>}
          </div>
        </div>
        <div className="ass-tab">
          <div className="ass-tab-label">CPU tableau</div>
          <div className="ass-tab-row">
            {state.cpuTableau.map((c, i) => (
              <div key={i} className={"ass-mini ass-suit-" + c.suit}>
                <span className="ass-mini-rank">{rankName(c.rank)}</span>
                <span className="ass-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.cpuTableau.length === 0 && <div className="ass-empty">(none yet)</div>}
          </div>
        </div>
      </div>
      <div className="ass-legend">
        Suits: {SUIT_NAMES.map((n, i) => <span key={i} className={"ass-leg ass-suit-" + i}>{n}</span>)}
        <span className="ass-rule">3 same suit +10 &middot; 5 same suit +20 &middot; pair +5 &middot; trip +12</span>
      </div>
    </div>
  );
}
