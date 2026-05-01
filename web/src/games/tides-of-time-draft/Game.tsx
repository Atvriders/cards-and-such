import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TidesOfTimeState, TidesOfTimeAction, TidesOfTimeSettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, suitName, rankName, SUIT_NAMES } from "./state.js";
import "./Game.css";

export function TidesOfTimeGame({ state, dispatch, onGameOver }: GameProps<TidesOfTimeState, TidesOfTimeSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const finalScore = score(state);
  return (
    <div className="ttd-wrap">
      <h3 className="ttd-title">Tides of Time</h3>
      <div className="ttd-stats">
        <div className="ttd-stat"><span>Round</span><b>{state.round}/5</b></div>
        <div className="ttd-stat"><span>You</span><b>{state.myScore}</b></div>
        <div className="ttd-stat"><span>CPU</span><b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="ttd-prompt">Pick one of 5 cards. CPU takes the highest remaining.</div>
          <div className="ttd-offer">
            {state.offer.map((c, i) => (
              <button key={c.id + ":" + i} className={"ttd-card ttd-suit-" + c.suit} onClick={() => dispatch({ type: "pick", idx: i } as TidesOfTimeAction)}>
                <div className="ttd-rank">{rankName(c.rank)}</div>
                <div className="ttd-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="ttd-event">
          <div className="ttd-event-line">{state.lastEvent}</div>
          <button className="ttd-next" onClick={() => dispatch({ type: "next" } as TidesOfTimeAction)}>Next Round &raquo;</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="ttd-done">
          <h3>{state.myScore > state.cpuScore ? "Victory!" : state.myScore === state.cpuScore ? "Draw" : "Defeat"}</h3>
          <div className="ttd-final">You: {state.myScore} &middot; CPU: {state.cpuScore}</div>
          <div className="ttd-final-score">Final score: <b>{finalScore}</b></div>
        </div>
      )}
      <div className="ttd-tableaus">
        <div className="ttd-tab">
          <div className="ttd-tab-label">Your tableau</div>
          <div className="ttd-tab-row">
            {state.myTableau.map((c, i) => (
              <div key={i} className={"ttd-mini ttd-suit-" + c.suit}>
                <span className="ttd-mini-rank">{rankName(c.rank)}</span>
                <span className="ttd-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.myTableau.length === 0 && <div className="ttd-empty">(none yet)</div>}
          </div>
        </div>
        <div className="ttd-tab">
          <div className="ttd-tab-label">CPU tableau</div>
          <div className="ttd-tab-row">
            {state.cpuTableau.map((c, i) => (
              <div key={i} className={"ttd-mini ttd-suit-" + c.suit}>
                <span className="ttd-mini-rank">{rankName(c.rank)}</span>
                <span className="ttd-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.cpuTableau.length === 0 && <div className="ttd-empty">(none yet)</div>}
          </div>
        </div>
      </div>
      <div className="ttd-legend">
        Suits: {SUIT_NAMES.map((n, i) => <span key={i} className={"ttd-leg ttd-suit-" + i}>{n}</span>)}
        <span className="ttd-rule">3 same suit +10 &middot; 5 same suit +20 &middot; pair +5 &middot; trip +12</span>
      </div>
    </div>
  );
}
