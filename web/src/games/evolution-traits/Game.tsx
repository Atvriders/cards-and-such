import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { EvolutionTraitsState, EvolutionTraitsAction, EvolutionTraitsSettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, suitName, rankName, SUIT_NAMES } from "./state.js";
import "./Game.css";

export function EvolutionTraitsGame({ state, dispatch, onGameOver }: GameProps<EvolutionTraitsState, EvolutionTraitsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const finalScore = score(state);
  return (
    <div className="evt-wrap">
      <h3 className="evt-title">Evolution: Traits</h3>
      <div className="evt-stats">
        <div className="evt-stat"><span>Round</span><b>{state.round}/8</b></div>
        <div className="evt-stat"><span>You</span><b>{state.myScore}</b></div>
        <div className="evt-stat"><span>CPU</span><b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="evt-prompt">Pick one of 4 cards. CPU takes the highest remaining.</div>
          <div className="evt-offer">
            {state.offer.map((c, i) => (
              <button key={c.id + ":" + i} className={"evt-card evt-suit-" + c.suit} onClick={() => dispatch({ type: "pick", idx: i } as EvolutionTraitsAction)}>
                <div className="evt-rank">{rankName(c.rank)}</div>
                <div className="evt-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="evt-event">
          <div className="evt-event-line">{state.lastEvent}</div>
          <button className="evt-next" onClick={() => dispatch({ type: "next" } as EvolutionTraitsAction)}>Next Round &raquo;</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="evt-done">
          <h3>{state.myScore > state.cpuScore ? "Victory!" : state.myScore === state.cpuScore ? "Draw" : "Defeat"}</h3>
          <div className="evt-final">You: {state.myScore} &middot; CPU: {state.cpuScore}</div>
          <div className="evt-final-score">Final score: <b>{finalScore}</b></div>
        </div>
      )}
      <div className="evt-tableaus">
        <div className="evt-tab">
          <div className="evt-tab-label">Your tableau</div>
          <div className="evt-tab-row">
            {state.myTableau.map((c, i) => (
              <div key={i} className={"evt-mini evt-suit-" + c.suit}>
                <span className="evt-mini-rank">{rankName(c.rank)}</span>
                <span className="evt-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.myTableau.length === 0 && <div className="evt-empty">(none yet)</div>}
          </div>
        </div>
        <div className="evt-tab">
          <div className="evt-tab-label">CPU tableau</div>
          <div className="evt-tab-row">
            {state.cpuTableau.map((c, i) => (
              <div key={i} className={"evt-mini evt-suit-" + c.suit}>
                <span className="evt-mini-rank">{rankName(c.rank)}</span>
                <span className="evt-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.cpuTableau.length === 0 && <div className="evt-empty">(none yet)</div>}
          </div>
        </div>
      </div>
      <div className="evt-legend">
        Suits: {SUIT_NAMES.map((n, i) => <span key={i} className={"evt-leg evt-suit-" + i}>{n}</span>)}
        <span className="evt-rule">3 same suit +10 &middot; 5 same suit +20 &middot; pair +5 &middot; trip +12</span>
      </div>
    </div>
  );
}
