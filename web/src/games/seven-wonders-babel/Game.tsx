import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SevenWondersBabelState, SevenWondersBabelAction, SevenWondersBabelSettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, suitName, rankName, SUIT_NAMES } from "./state.js";
import "./Game.css";

export function SevenWondersBabelGame({ state, dispatch, onGameOver }: GameProps<SevenWondersBabelState, SevenWondersBabelSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const finalScore = score(state);
  return (
    <div className="swb-wrap">
      <h3 className="swb-title">Seven Wonders: Babel</h3>
      <div className="swb-stats">
        <div className="swb-stat"><span>Round</span><b>{state.round}/8</b></div>
        <div className="swb-stat"><span>You</span><b>{state.myScore}</b></div>
        <div className="swb-stat"><span>CPU</span><b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="swb-prompt">Pick one of 4 cards. CPU takes the highest remaining.</div>
          <div className="swb-offer">
            {state.offer.map((c, i) => (
              <button key={c.id + ":" + i} className={"swb-card swb-suit-" + c.suit} onClick={() => dispatch({ type: "pick", idx: i } as SevenWondersBabelAction)}>
                <div className="swb-rank">{rankName(c.rank)}</div>
                <div className="swb-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="swb-event">
          <div className="swb-event-line">{state.lastEvent}</div>
          <button className="swb-next" onClick={() => dispatch({ type: "next" } as SevenWondersBabelAction)}>Next Round &raquo;</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="swb-done">
          <h3>{state.myScore > state.cpuScore ? "Victory!" : state.myScore === state.cpuScore ? "Draw" : "Defeat"}</h3>
          <div className="swb-final">You: {state.myScore} &middot; CPU: {state.cpuScore}</div>
          <div className="swb-final-score">Final score: <b>{finalScore}</b></div>
        </div>
      )}
      <div className="swb-tableaus">
        <div className="swb-tab">
          <div className="swb-tab-label">Your tableau</div>
          <div className="swb-tab-row">
            {state.myTableau.map((c, i) => (
              <div key={i} className={"swb-mini swb-suit-" + c.suit}>
                <span className="swb-mini-rank">{rankName(c.rank)}</span>
                <span className="swb-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.myTableau.length === 0 && <div className="swb-empty">(none yet)</div>}
          </div>
        </div>
        <div className="swb-tab">
          <div className="swb-tab-label">CPU tableau</div>
          <div className="swb-tab-row">
            {state.cpuTableau.map((c, i) => (
              <div key={i} className={"swb-mini swb-suit-" + c.suit}>
                <span className="swb-mini-rank">{rankName(c.rank)}</span>
                <span className="swb-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.cpuTableau.length === 0 && <div className="swb-empty">(none yet)</div>}
          </div>
        </div>
      </div>
      <div className="swb-legend">
        Suits: {SUIT_NAMES.map((n, i) => <span key={i} className={"swb-leg swb-suit-" + i}>{n}</span>)}
        <span className="swb-rule">3 same suit +10 &middot; 5 same suit +20 &middot; pair +5 &middot; trip +12</span>
      </div>
    </div>
  );
}
