import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BetweenTwoCastlesLudwigState, BetweenTwoCastlesLudwigAction, BetweenTwoCastlesLudwigSettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, suitName, rankName, SUIT_NAMES } from "./state.js";
import "./Game.css";

export function BetweenTwoCastlesLudwigGame({ state, dispatch, onGameOver }: GameProps<BetweenTwoCastlesLudwigState, BetweenTwoCastlesLudwigSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const finalScore = score(state);
  return (
    <div className="b2cl-wrap">
      <h3 className="b2cl-title">Between Two Castles</h3>
      <div className="b2cl-stats">
        <div className="b2cl-stat"><span>Round</span><b>{state.round}/9</b></div>
        <div className="b2cl-stat"><span>You</span><b>{state.myScore}</b></div>
        <div className="b2cl-stat"><span>CPU</span><b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="b2cl-prompt">Pick one of 4 cards. CPU takes the highest remaining.</div>
          <div className="b2cl-offer">
            {state.offer.map((c, i) => (
              <button key={c.id + ":" + i} className={"b2cl-card b2cl-suit-" + c.suit} onClick={() => dispatch({ type: "pick", idx: i } as BetweenTwoCastlesLudwigAction)}>
                <div className="b2cl-rank">{rankName(c.rank)}</div>
                <div className="b2cl-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="b2cl-event">
          <div className="b2cl-event-line">{state.lastEvent}</div>
          <button className="b2cl-next" onClick={() => dispatch({ type: "next" } as BetweenTwoCastlesLudwigAction)}>Next Round &raquo;</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="b2cl-done">
          <h3>{state.myScore > state.cpuScore ? "Victory!" : state.myScore === state.cpuScore ? "Draw" : "Defeat"}</h3>
          <div className="b2cl-final">You: {state.myScore} &middot; CPU: {state.cpuScore}</div>
          <div className="b2cl-final-score">Final score: <b>{finalScore}</b></div>
        </div>
      )}
      <div className="b2cl-tableaus">
        <div className="b2cl-tab">
          <div className="b2cl-tab-label">Your tableau</div>
          <div className="b2cl-tab-row">
            {state.myTableau.map((c, i) => (
              <div key={i} className={"b2cl-mini b2cl-suit-" + c.suit}>
                <span className="b2cl-mini-rank">{rankName(c.rank)}</span>
                <span className="b2cl-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.myTableau.length === 0 && <div className="b2cl-empty">(none yet)</div>}
          </div>
        </div>
        <div className="b2cl-tab">
          <div className="b2cl-tab-label">CPU tableau</div>
          <div className="b2cl-tab-row">
            {state.cpuTableau.map((c, i) => (
              <div key={i} className={"b2cl-mini b2cl-suit-" + c.suit}>
                <span className="b2cl-mini-rank">{rankName(c.rank)}</span>
                <span className="b2cl-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.cpuTableau.length === 0 && <div className="b2cl-empty">(none yet)</div>}
          </div>
        </div>
      </div>
      <div className="b2cl-legend">
        Suits: {SUIT_NAMES.map((n, i) => <span key={i} className={"b2cl-leg b2cl-suit-" + i}>{n}</span>)}
        <span className="b2cl-rule">3 same suit +10 &middot; 5 same suit +20 &middot; pair +5 &middot; trip +12</span>
      </div>
    </div>
  );
}
