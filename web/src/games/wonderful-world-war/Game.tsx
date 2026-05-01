import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WonderfulWorldWarState, WonderfulWorldWarAction, WonderfulWorldWarSettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, suitName, rankName, SUIT_NAMES } from "./state.js";
import "./Game.css";

export function WonderfulWorldWarGame({ state, dispatch, onGameOver }: GameProps<WonderfulWorldWarState, WonderfulWorldWarSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const finalScore = score(state);
  return (
    <div className="iwww-wrap">
      <h3 className="iwww-title">IWW: War</h3>
      <div className="iwww-stats">
        <div className="iwww-stat"><span>Round</span><b>{state.round}/9</b></div>
        <div className="iwww-stat"><span>You</span><b>{state.myScore}</b></div>
        <div className="iwww-stat"><span>CPU</span><b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="iwww-prompt">Pick one of 4 cards. CPU takes the highest remaining.</div>
          <div className="iwww-offer">
            {state.offer.map((c, i) => (
              <button key={c.id + ":" + i} className={"iwww-card iwww-suit-" + c.suit} onClick={() => dispatch({ type: "pick", idx: i } as WonderfulWorldWarAction)}>
                <div className="iwww-rank">{rankName(c.rank)}</div>
                <div className="iwww-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="iwww-event">
          <div className="iwww-event-line">{state.lastEvent}</div>
          <button className="iwww-next" onClick={() => dispatch({ type: "next" } as WonderfulWorldWarAction)}>Next Round &raquo;</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="iwww-done">
          <h3>{state.myScore > state.cpuScore ? "Victory!" : state.myScore === state.cpuScore ? "Draw" : "Defeat"}</h3>
          <div className="iwww-final">You: {state.myScore} &middot; CPU: {state.cpuScore}</div>
          <div className="iwww-final-score">Final score: <b>{finalScore}</b></div>
        </div>
      )}
      <div className="iwww-tableaus">
        <div className="iwww-tab">
          <div className="iwww-tab-label">Your tableau</div>
          <div className="iwww-tab-row">
            {state.myTableau.map((c, i) => (
              <div key={i} className={"iwww-mini iwww-suit-" + c.suit}>
                <span className="iwww-mini-rank">{rankName(c.rank)}</span>
                <span className="iwww-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.myTableau.length === 0 && <div className="iwww-empty">(none yet)</div>}
          </div>
        </div>
        <div className="iwww-tab">
          <div className="iwww-tab-label">CPU tableau</div>
          <div className="iwww-tab-row">
            {state.cpuTableau.map((c, i) => (
              <div key={i} className={"iwww-mini iwww-suit-" + c.suit}>
                <span className="iwww-mini-rank">{rankName(c.rank)}</span>
                <span className="iwww-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.cpuTableau.length === 0 && <div className="iwww-empty">(none yet)</div>}
          </div>
        </div>
      </div>
      <div className="iwww-legend">
        Suits: {SUIT_NAMES.map((n, i) => <span key={i} className={"iwww-leg iwww-suit-" + i}>{n}</span>)}
        <span className="iwww-rule">3 same suit +10 &middot; 5 same suit +20 &middot; pair +5 &middot; trip +12</span>
      </div>
    </div>
  );
}
