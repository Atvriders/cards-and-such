import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BetweenTwoCitiesState, BetweenTwoCitiesAction, BetweenTwoCitiesSettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, suitName, rankName, SUIT_NAMES } from "./state.js";
import "./Game.css";

export function BetweenTwoCitiesGame({ state, dispatch, onGameOver }: GameProps<BetweenTwoCitiesState, BetweenTwoCitiesSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const finalScore = score(state);
  return (
    <div className="b2c-wrap">
      <h3 className="b2c-title">Between Two Cities</h3>
      <div className="b2c-stats">
        <div className="b2c-stat"><span>Round</span><b>{state.round}/8</b></div>
        <div className="b2c-stat"><span>You</span><b>{state.myScore}</b></div>
        <div className="b2c-stat"><span>CPU</span><b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="b2c-prompt">Pick one of 4 cards. CPU takes the highest remaining.</div>
          <div className="b2c-offer">
            {state.offer.map((c, i) => (
              <button key={c.id + ":" + i} className={"b2c-card b2c-suit-" + c.suit} onClick={() => dispatch({ type: "pick", idx: i } as BetweenTwoCitiesAction)}>
                <div className="b2c-rank">{rankName(c.rank)}</div>
                <div className="b2c-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="b2c-event">
          <div className="b2c-event-line">{state.lastEvent}</div>
          <button className="b2c-next" onClick={() => dispatch({ type: "next" } as BetweenTwoCitiesAction)}>Next Round &raquo;</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="b2c-done">
          <h3>{state.myScore > state.cpuScore ? "Victory!" : state.myScore === state.cpuScore ? "Draw" : "Defeat"}</h3>
          <div className="b2c-final">You: {state.myScore} &middot; CPU: {state.cpuScore}</div>
          <div className="b2c-final-score">Final score: <b>{finalScore}</b></div>
        </div>
      )}
      <div className="b2c-tableaus">
        <div className="b2c-tab">
          <div className="b2c-tab-label">Your tableau</div>
          <div className="b2c-tab-row">
            {state.myTableau.map((c, i) => (
              <div key={i} className={"b2c-mini b2c-suit-" + c.suit}>
                <span className="b2c-mini-rank">{rankName(c.rank)}</span>
                <span className="b2c-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.myTableau.length === 0 && <div className="b2c-empty">(none yet)</div>}
          </div>
        </div>
        <div className="b2c-tab">
          <div className="b2c-tab-label">CPU tableau</div>
          <div className="b2c-tab-row">
            {state.cpuTableau.map((c, i) => (
              <div key={i} className={"b2c-mini b2c-suit-" + c.suit}>
                <span className="b2c-mini-rank">{rankName(c.rank)}</span>
                <span className="b2c-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.cpuTableau.length === 0 && <div className="b2c-empty">(none yet)</div>}
          </div>
        </div>
      </div>
      <div className="b2c-legend">
        Suits: {SUIT_NAMES.map((n, i) => <span key={i} className={"b2c-leg b2c-suit-" + i}>{n}</span>)}
        <span className="b2c-rule">3 same suit +10 &middot; 5 same suit +20 &middot; pair +5 &middot; trip +12</span>
      </div>
    </div>
  );
}
