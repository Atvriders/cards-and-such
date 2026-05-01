import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SevenWondersDuelPyramidState, SevenWondersDuelPyramidAction, SevenWondersDuelPyramidSettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, suitName, rankName, SUIT_NAMES } from "./state.js";
import "./Game.css";

export function SevenWondersDuelPyramidGame({ state, dispatch, onGameOver }: GameProps<SevenWondersDuelPyramidState, SevenWondersDuelPyramidSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const finalScore = score(state);
  return (
    <div className="swdp-wrap">
      <h3 className="swdp-title">Seven Wonders Duel: Pyramid</h3>
      <div className="swdp-stats">
        <div className="swdp-stat"><span>Round</span><b>{state.round}/9</b></div>
        <div className="swdp-stat"><span>You</span><b>{state.myScore}</b></div>
        <div className="swdp-stat"><span>CPU</span><b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="swdp-prompt">Pick one of 3 cards. CPU takes the highest remaining.</div>
          <div className="swdp-offer">
            {state.offer.map((c, i) => (
              <button key={c.id + ":" + i} className={"swdp-card swdp-suit-" + c.suit} onClick={() => dispatch({ type: "pick", idx: i } as SevenWondersDuelPyramidAction)}>
                <div className="swdp-rank">{rankName(c.rank)}</div>
                <div className="swdp-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="swdp-event">
          <div className="swdp-event-line">{state.lastEvent}</div>
          <button className="swdp-next" onClick={() => dispatch({ type: "next" } as SevenWondersDuelPyramidAction)}>Next Round &raquo;</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="swdp-done">
          <h3>{state.myScore > state.cpuScore ? "Victory!" : state.myScore === state.cpuScore ? "Draw" : "Defeat"}</h3>
          <div className="swdp-final">You: {state.myScore} &middot; CPU: {state.cpuScore}</div>
          <div className="swdp-final-score">Final score: <b>{finalScore}</b></div>
        </div>
      )}
      <div className="swdp-tableaus">
        <div className="swdp-tab">
          <div className="swdp-tab-label">Your tableau</div>
          <div className="swdp-tab-row">
            {state.myTableau.map((c, i) => (
              <div key={i} className={"swdp-mini swdp-suit-" + c.suit}>
                <span className="swdp-mini-rank">{rankName(c.rank)}</span>
                <span className="swdp-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.myTableau.length === 0 && <div className="swdp-empty">(none yet)</div>}
          </div>
        </div>
        <div className="swdp-tab">
          <div className="swdp-tab-label">CPU tableau</div>
          <div className="swdp-tab-row">
            {state.cpuTableau.map((c, i) => (
              <div key={i} className={"swdp-mini swdp-suit-" + c.suit}>
                <span className="swdp-mini-rank">{rankName(c.rank)}</span>
                <span className="swdp-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.cpuTableau.length === 0 && <div className="swdp-empty">(none yet)</div>}
          </div>
        </div>
      </div>
      <div className="swdp-legend">
        Suits: {SUIT_NAMES.map((n, i) => <span key={i} className={"swdp-leg swdp-suit-" + i}>{n}</span>)}
        <span className="swdp-rule">3 same suit +10 &middot; 5 same suit +20 &middot; pair +5 &middot; trip +12</span>
      </div>
    </div>
  );
}
