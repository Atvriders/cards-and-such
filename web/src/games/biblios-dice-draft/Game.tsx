import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BibliosDiceDraftState, BibliosDiceDraftAction, BibliosDiceDraftSettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, suitName, rankName, SUIT_NAMES } from "./state.js";
import "./Game.css";

export function BibliosDiceDraftGame({ state, dispatch, onGameOver }: GameProps<BibliosDiceDraftState, BibliosDiceDraftSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const finalScore = score(state);
  return (
    <div className="bbd-wrap">
      <h3 className="bbd-title">Biblios Dice</h3>
      <div className="bbd-stats">
        <div className="bbd-stat"><span>Round</span><b>{state.round}/8</b></div>
        <div className="bbd-stat"><span>You</span><b>{state.myScore}</b></div>
        <div className="bbd-stat"><span>CPU</span><b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="bbd-prompt">Pick one of 4 cards. CPU takes the highest remaining.</div>
          <div className="bbd-offer">
            {state.offer.map((c, i) => (
              <button key={c.id + ":" + i} className={"bbd-card bbd-suit-" + c.suit} onClick={() => dispatch({ type: "pick", idx: i } as BibliosDiceDraftAction)}>
                <div className="bbd-rank">{rankName(c.rank)}</div>
                <div className="bbd-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="bbd-event">
          <div className="bbd-event-line">{state.lastEvent}</div>
          <button className="bbd-next" onClick={() => dispatch({ type: "next" } as BibliosDiceDraftAction)}>Next Round &raquo;</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="bbd-done">
          <h3>{state.myScore > state.cpuScore ? "Victory!" : state.myScore === state.cpuScore ? "Draw" : "Defeat"}</h3>
          <div className="bbd-final">You: {state.myScore} &middot; CPU: {state.cpuScore}</div>
          <div className="bbd-final-score">Final score: <b>{finalScore}</b></div>
        </div>
      )}
      <div className="bbd-tableaus">
        <div className="bbd-tab">
          <div className="bbd-tab-label">Your tableau</div>
          <div className="bbd-tab-row">
            {state.myTableau.map((c, i) => (
              <div key={i} className={"bbd-mini bbd-suit-" + c.suit}>
                <span className="bbd-mini-rank">{rankName(c.rank)}</span>
                <span className="bbd-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.myTableau.length === 0 && <div className="bbd-empty">(none yet)</div>}
          </div>
        </div>
        <div className="bbd-tab">
          <div className="bbd-tab-label">CPU tableau</div>
          <div className="bbd-tab-row">
            {state.cpuTableau.map((c, i) => (
              <div key={i} className={"bbd-mini bbd-suit-" + c.suit}>
                <span className="bbd-mini-rank">{rankName(c.rank)}</span>
                <span className="bbd-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.cpuTableau.length === 0 && <div className="bbd-empty">(none yet)</div>}
          </div>
        </div>
      </div>
      <div className="bbd-legend">
        Suits: {SUIT_NAMES.map((n, i) => <span key={i} className={"bbd-leg bbd-suit-" + i}>{n}</span>)}
        <span className="bbd-rule">3 same suit +10 &middot; 5 same suit +20 &middot; pair +5 &middot; trip +12</span>
      </div>
    </div>
  );
}
