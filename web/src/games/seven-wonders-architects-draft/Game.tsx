import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SevenWondersArchitectsDraftState, SevenWondersArchitectsDraftAction, SevenWondersArchitectsDraftSettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, suitName, rankName, SUIT_NAMES } from "./state.js";
import "./Game.css";

export function SevenWondersArchitectsDraftGame({ state, dispatch, onGameOver }: GameProps<SevenWondersArchitectsDraftState, SevenWondersArchitectsDraftSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const finalScore = score(state);
  return (
    <div className="swad-wrap">
      <h3 className="swad-title">Seven Wonders: Architects</h3>
      <div className="swad-stats">
        <div className="swad-stat"><span>Round</span><b>{state.round}/8</b></div>
        <div className="swad-stat"><span>You</span><b>{state.myScore}</b></div>
        <div className="swad-stat"><span>CPU</span><b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="swad-prompt">Pick one of 3 cards. CPU takes the highest remaining.</div>
          <div className="swad-offer">
            {state.offer.map((c, i) => (
              <button key={c.id + ":" + i} className={"swad-card swad-suit-" + c.suit} onClick={() => dispatch({ type: "pick", idx: i } as SevenWondersArchitectsDraftAction)}>
                <div className="swad-rank">{rankName(c.rank)}</div>
                <div className="swad-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="swad-event">
          <div className="swad-event-line">{state.lastEvent}</div>
          <button className="swad-next" onClick={() => dispatch({ type: "next" } as SevenWondersArchitectsDraftAction)}>Next Round &raquo;</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="swad-done">
          <h3>{state.myScore > state.cpuScore ? "Victory!" : state.myScore === state.cpuScore ? "Draw" : "Defeat"}</h3>
          <div className="swad-final">You: {state.myScore} &middot; CPU: {state.cpuScore}</div>
          <div className="swad-final-score">Final score: <b>{finalScore}</b></div>
        </div>
      )}
      <div className="swad-tableaus">
        <div className="swad-tab">
          <div className="swad-tab-label">Your tableau</div>
          <div className="swad-tab-row">
            {state.myTableau.map((c, i) => (
              <div key={i} className={"swad-mini swad-suit-" + c.suit}>
                <span className="swad-mini-rank">{rankName(c.rank)}</span>
                <span className="swad-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.myTableau.length === 0 && <div className="swad-empty">(none yet)</div>}
          </div>
        </div>
        <div className="swad-tab">
          <div className="swad-tab-label">CPU tableau</div>
          <div className="swad-tab-row">
            {state.cpuTableau.map((c, i) => (
              <div key={i} className={"swad-mini swad-suit-" + c.suit}>
                <span className="swad-mini-rank">{rankName(c.rank)}</span>
                <span className="swad-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.cpuTableau.length === 0 && <div className="swad-empty">(none yet)</div>}
          </div>
        </div>
      </div>
      <div className="swad-legend">
        Suits: {SUIT_NAMES.map((n, i) => <span key={i} className={"swad-leg swad-suit-" + i}>{n}</span>)}
        <span className="swad-rule">3 same suit +10 &middot; 5 same suit +20 &middot; pair +5 &middot; trip +12</span>
      </div>
    </div>
  );
}
