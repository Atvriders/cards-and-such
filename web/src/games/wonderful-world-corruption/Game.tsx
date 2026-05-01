import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WonderfulWorldCorruptionState, WonderfulWorldCorruptionAction, WonderfulWorldCorruptionSettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, suitName, rankName, SUIT_NAMES } from "./state.js";
import "./Game.css";

export function WonderfulWorldCorruptionGame({ state, dispatch, onGameOver }: GameProps<WonderfulWorldCorruptionState, WonderfulWorldCorruptionSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const finalScore = score(state);
  return (
    <div className="iwwc-wrap">
      <h3 className="iwwc-title">IWW: Corruption</h3>
      <div className="iwwc-stats">
        <div className="iwwc-stat"><span>Round</span><b>{state.round}/8</b></div>
        <div className="iwwc-stat"><span>You</span><b>{state.myScore}</b></div>
        <div className="iwwc-stat"><span>CPU</span><b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="iwwc-prompt">Pick one of 3 cards. CPU takes the highest remaining.</div>
          <div className="iwwc-offer">
            {state.offer.map((c, i) => (
              <button key={c.id + ":" + i} className={"iwwc-card iwwc-suit-" + c.suit} onClick={() => dispatch({ type: "pick", idx: i } as WonderfulWorldCorruptionAction)}>
                <div className="iwwc-rank">{rankName(c.rank)}</div>
                <div className="iwwc-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="iwwc-event">
          <div className="iwwc-event-line">{state.lastEvent}</div>
          <button className="iwwc-next" onClick={() => dispatch({ type: "next" } as WonderfulWorldCorruptionAction)}>Next Round &raquo;</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="iwwc-done">
          <h3>{state.myScore > state.cpuScore ? "Victory!" : state.myScore === state.cpuScore ? "Draw" : "Defeat"}</h3>
          <div className="iwwc-final">You: {state.myScore} &middot; CPU: {state.cpuScore}</div>
          <div className="iwwc-final-score">Final score: <b>{finalScore}</b></div>
        </div>
      )}
      <div className="iwwc-tableaus">
        <div className="iwwc-tab">
          <div className="iwwc-tab-label">Your tableau</div>
          <div className="iwwc-tab-row">
            {state.myTableau.map((c, i) => (
              <div key={i} className={"iwwc-mini iwwc-suit-" + c.suit}>
                <span className="iwwc-mini-rank">{rankName(c.rank)}</span>
                <span className="iwwc-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.myTableau.length === 0 && <div className="iwwc-empty">(none yet)</div>}
          </div>
        </div>
        <div className="iwwc-tab">
          <div className="iwwc-tab-label">CPU tableau</div>
          <div className="iwwc-tab-row">
            {state.cpuTableau.map((c, i) => (
              <div key={i} className={"iwwc-mini iwwc-suit-" + c.suit}>
                <span className="iwwc-mini-rank">{rankName(c.rank)}</span>
                <span className="iwwc-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.cpuTableau.length === 0 && <div className="iwwc-empty">(none yet)</div>}
          </div>
        </div>
      </div>
      <div className="iwwc-legend">
        Suits: {SUIT_NAMES.map((n, i) => <span key={i} className={"iwwc-leg iwwc-suit-" + i}>{n}</span>)}
        <span className="iwwc-rule">3 same suit +10 &middot; 5 same suit +20 &middot; pair +5 &middot; trip +12</span>
      </div>
    </div>
  );
}
