import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WonderfulWorldDraftState, WonderfulWorldDraftAction, WonderfulWorldDraftSettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, suitName, rankName, SUIT_NAMES } from "./state.js";
import "./Game.css";

export function WonderfulWorldDraftGame({ state, dispatch, onGameOver }: GameProps<WonderfulWorldDraftState, WonderfulWorldDraftSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const finalScore = score(state);
  return (
    <div className="iwwd-wrap">
      <h3 className="iwwd-title">It is a Wonderful World Draft</h3>
      <div className="iwwd-stats">
        <div className="iwwd-stat"><span>Round</span><b>{state.round}/9</b></div>
        <div className="iwwd-stat"><span>You</span><b>{state.myScore}</b></div>
        <div className="iwwd-stat"><span>CPU</span><b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="iwwd-prompt">Pick one of 4 cards. CPU takes the highest remaining.</div>
          <div className="iwwd-offer">
            {state.offer.map((c, i) => (
              <button key={c.id + ":" + i} className={"iwwd-card iwwd-suit-" + c.suit} onClick={() => dispatch({ type: "pick", idx: i } as WonderfulWorldDraftAction)}>
                <div className="iwwd-rank">{rankName(c.rank)}</div>
                <div className="iwwd-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="iwwd-event">
          <div className="iwwd-event-line">{state.lastEvent}</div>
          <button className="iwwd-next" onClick={() => dispatch({ type: "next" } as WonderfulWorldDraftAction)}>Next Round &raquo;</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="iwwd-done">
          <h3>{state.myScore > state.cpuScore ? "Victory!" : state.myScore === state.cpuScore ? "Draw" : "Defeat"}</h3>
          <div className="iwwd-final">You: {state.myScore} &middot; CPU: {state.cpuScore}</div>
          <div className="iwwd-final-score">Final score: <b>{finalScore}</b></div>
        </div>
      )}
      <div className="iwwd-tableaus">
        <div className="iwwd-tab">
          <div className="iwwd-tab-label">Your tableau</div>
          <div className="iwwd-tab-row">
            {state.myTableau.map((c, i) => (
              <div key={i} className={"iwwd-mini iwwd-suit-" + c.suit}>
                <span className="iwwd-mini-rank">{rankName(c.rank)}</span>
                <span className="iwwd-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.myTableau.length === 0 && <div className="iwwd-empty">(none yet)</div>}
          </div>
        </div>
        <div className="iwwd-tab">
          <div className="iwwd-tab-label">CPU tableau</div>
          <div className="iwwd-tab-row">
            {state.cpuTableau.map((c, i) => (
              <div key={i} className={"iwwd-mini iwwd-suit-" + c.suit}>
                <span className="iwwd-mini-rank">{rankName(c.rank)}</span>
                <span className="iwwd-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.cpuTableau.length === 0 && <div className="iwwd-empty">(none yet)</div>}
          </div>
        </div>
      </div>
      <div className="iwwd-legend">
        Suits: {SUIT_NAMES.map((n, i) => <span key={i} className={"iwwd-leg iwwd-suit-" + i}>{n}</span>)}
        <span className="iwwd-rule">3 same suit +10 &middot; 5 same suit +20 &middot; pair +5 &middot; trip +12</span>
      </div>
    </div>
  );
}
