import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { EvolutionClimateState, EvolutionClimateAction, EvolutionClimateSettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, suitName, rankName, SUIT_NAMES } from "./state.js";
import "./Game.css";

export function EvolutionClimateGame({ state, dispatch, onGameOver }: GameProps<EvolutionClimateState, EvolutionClimateSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const finalScore = score(state);
  return (
    <div className="evc-wrap">
      <h3 className="evc-title">Evolution: Climate</h3>
      <div className="evc-stats">
        <div className="evc-stat"><span>Round</span><b>{state.round}/8</b></div>
        <div className="evc-stat"><span>You</span><b>{state.myScore}</b></div>
        <div className="evc-stat"><span>CPU</span><b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="evc-prompt">Pick one of 3 cards. CPU takes the highest remaining.</div>
          <div className="evc-offer">
            {state.offer.map((c, i) => (
              <button key={c.id + ":" + i} className={"evc-card evc-suit-" + c.suit} onClick={() => dispatch({ type: "pick", idx: i } as EvolutionClimateAction)}>
                <div className="evc-rank">{rankName(c.rank)}</div>
                <div className="evc-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="evc-event">
          <div className="evc-event-line">{state.lastEvent}</div>
          <button className="evc-next" onClick={() => dispatch({ type: "next" } as EvolutionClimateAction)}>Next Round &raquo;</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="evc-done">
          <h3>{state.myScore > state.cpuScore ? "Victory!" : state.myScore === state.cpuScore ? "Draw" : "Defeat"}</h3>
          <div className="evc-final">You: {state.myScore} &middot; CPU: {state.cpuScore}</div>
          <div className="evc-final-score">Final score: <b>{finalScore}</b></div>
        </div>
      )}
      <div className="evc-tableaus">
        <div className="evc-tab">
          <div className="evc-tab-label">Your tableau</div>
          <div className="evc-tab-row">
            {state.myTableau.map((c, i) => (
              <div key={i} className={"evc-mini evc-suit-" + c.suit}>
                <span className="evc-mini-rank">{rankName(c.rank)}</span>
                <span className="evc-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.myTableau.length === 0 && <div className="evc-empty">(none yet)</div>}
          </div>
        </div>
        <div className="evc-tab">
          <div className="evc-tab-label">CPU tableau</div>
          <div className="evc-tab-row">
            {state.cpuTableau.map((c, i) => (
              <div key={i} className={"evc-mini evc-suit-" + c.suit}>
                <span className="evc-mini-rank">{rankName(c.rank)}</span>
                <span className="evc-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.cpuTableau.length === 0 && <div className="evc-empty">(none yet)</div>}
          </div>
        </div>
      </div>
      <div className="evc-legend">
        Suits: {SUIT_NAMES.map((n, i) => <span key={i} className={"evc-leg evc-suit-" + i}>{n}</span>)}
        <span className="evc-rule">3 same suit +10 &middot; 5 same suit +20 &middot; pair +5 &middot; trip +12</span>
      </div>
    </div>
  );
}
