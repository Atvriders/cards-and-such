import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SevenWondersEdificeState, SevenWondersEdificeAction, SevenWondersEdificeSettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, suitName, rankName, SUIT_NAMES } from "./state.js";
import "./Game.css";

export function SevenWondersEdificeGame({ state, dispatch, onGameOver }: GameProps<SevenWondersEdificeState, SevenWondersEdificeSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const finalScore = score(state);
  return (
    <div className="swe-wrap">
      <h3 className="swe-title">Seven Wonders: Edifice</h3>
      <div className="swe-stats">
        <div className="swe-stat"><span>Round</span><b>{state.round}/9</b></div>
        <div className="swe-stat"><span>You</span><b>{state.myScore}</b></div>
        <div className="swe-stat"><span>CPU</span><b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="swe-prompt">Pick one of 3 cards. CPU takes the highest remaining.</div>
          <div className="swe-offer">
            {state.offer.map((c, i) => (
              <button key={c.id + ":" + i} className={"swe-card swe-suit-" + c.suit} onClick={() => dispatch({ type: "pick", idx: i } as SevenWondersEdificeAction)}>
                <div className="swe-rank">{rankName(c.rank)}</div>
                <div className="swe-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="swe-event">
          <div className="swe-event-line">{state.lastEvent}</div>
          <button className="swe-next" onClick={() => dispatch({ type: "next" } as SevenWondersEdificeAction)}>Next Round &raquo;</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="swe-done">
          <h3>{state.myScore > state.cpuScore ? "Victory!" : state.myScore === state.cpuScore ? "Draw" : "Defeat"}</h3>
          <div className="swe-final">You: {state.myScore} &middot; CPU: {state.cpuScore}</div>
          <div className="swe-final-score">Final score: <b>{finalScore}</b></div>
        </div>
      )}
      <div className="swe-tableaus">
        <div className="swe-tab">
          <div className="swe-tab-label">Your tableau</div>
          <div className="swe-tab-row">
            {state.myTableau.map((c, i) => (
              <div key={i} className={"swe-mini swe-suit-" + c.suit}>
                <span className="swe-mini-rank">{rankName(c.rank)}</span>
                <span className="swe-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.myTableau.length === 0 && <div className="swe-empty">(none yet)</div>}
          </div>
        </div>
        <div className="swe-tab">
          <div className="swe-tab-label">CPU tableau</div>
          <div className="swe-tab-row">
            {state.cpuTableau.map((c, i) => (
              <div key={i} className={"swe-mini swe-suit-" + c.suit}>
                <span className="swe-mini-rank">{rankName(c.rank)}</span>
                <span className="swe-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.cpuTableau.length === 0 && <div className="swe-empty">(none yet)</div>}
          </div>
        </div>
      </div>
      <div className="swe-legend">
        Suits: {SUIT_NAMES.map((n, i) => <span key={i} className={"swe-leg swe-suit-" + i}>{n}</span>)}
        <span className="swe-rule">3 same suit +10 &middot; 5 same suit +20 &middot; pair +5 &middot; trip +12</span>
      </div>
    </div>
  );
}
