import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SevenWondersLeadersState, SevenWondersLeadersAction, SevenWondersLeadersSettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, suitName, rankName, SUIT_NAMES } from "./state.js";
import "./Game.css";

export function SevenWondersLeadersGame({ state, dispatch, onGameOver }: GameProps<SevenWondersLeadersState, SevenWondersLeadersSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const finalScore = score(state);
  return (
    <div className="swl-wrap">
      <h3 className="swl-title">Seven Wonders: Leaders</h3>
      <div className="swl-stats">
        <div className="swl-stat"><span>Round</span><b>{state.round}/8</b></div>
        <div className="swl-stat"><span>You</span><b>{state.myScore}</b></div>
        <div className="swl-stat"><span>CPU</span><b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="swl-prompt">Pick one of 4 cards. CPU takes the highest remaining.</div>
          <div className="swl-offer">
            {state.offer.map((c, i) => (
              <button key={c.id + ":" + i} className={"swl-card swl-suit-" + c.suit} onClick={() => dispatch({ type: "pick", idx: i } as SevenWondersLeadersAction)}>
                <div className="swl-rank">{rankName(c.rank)}</div>
                <div className="swl-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="swl-event">
          <div className="swl-event-line">{state.lastEvent}</div>
          <button className="swl-next" onClick={() => dispatch({ type: "next" } as SevenWondersLeadersAction)}>Next Round &raquo;</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="swl-done">
          <h3>{state.myScore > state.cpuScore ? "Victory!" : state.myScore === state.cpuScore ? "Draw" : "Defeat"}</h3>
          <div className="swl-final">You: {state.myScore} &middot; CPU: {state.cpuScore}</div>
          <div className="swl-final-score">Final score: <b>{finalScore}</b></div>
        </div>
      )}
      <div className="swl-tableaus">
        <div className="swl-tab">
          <div className="swl-tab-label">Your tableau</div>
          <div className="swl-tab-row">
            {state.myTableau.map((c, i) => (
              <div key={i} className={"swl-mini swl-suit-" + c.suit}>
                <span className="swl-mini-rank">{rankName(c.rank)}</span>
                <span className="swl-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.myTableau.length === 0 && <div className="swl-empty">(none yet)</div>}
          </div>
        </div>
        <div className="swl-tab">
          <div className="swl-tab-label">CPU tableau</div>
          <div className="swl-tab-row">
            {state.cpuTableau.map((c, i) => (
              <div key={i} className={"swl-mini swl-suit-" + c.suit}>
                <span className="swl-mini-rank">{rankName(c.rank)}</span>
                <span className="swl-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.cpuTableau.length === 0 && <div className="swl-empty">(none yet)</div>}
          </div>
        </div>
      </div>
      <div className="swl-legend">
        Suits: {SUIT_NAMES.map((n, i) => <span key={i} className={"swl-leg swl-suit-" + i}>{n}</span>)}
        <span className="swl-rule">3 same suit +10 &middot; 5 same suit +20 &middot; pair +5 &middot; trip +12</span>
      </div>
    </div>
  );
}
