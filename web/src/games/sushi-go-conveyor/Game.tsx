import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SushiGoConveyorState, SushiGoConveyorAction, SushiGoConveyorSettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, suitName, rankName, SUIT_NAMES } from "./state.js";
import "./Game.css";

export function SushiGoConveyorGame({ state, dispatch, onGameOver }: GameProps<SushiGoConveyorState, SushiGoConveyorSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const finalScore = score(state);
  return (
    <div className="sgc-wrap">
      <h3 className="sgc-title">Sushi Go Conveyor</h3>
      <div className="sgc-stats">
        <div className="sgc-stat"><span>Round</span><b>{state.round}/8</b></div>
        <div className="sgc-stat"><span>You</span><b>{state.myScore}</b></div>
        <div className="sgc-stat"><span>CPU</span><b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="sgc-prompt">Pick one of 3 cards. CPU takes the highest remaining.</div>
          <div className="sgc-offer">
            {state.offer.map((c, i) => (
              <button key={c.id + ":" + i} className={"sgc-card sgc-suit-" + c.suit} onClick={() => dispatch({ type: "pick", idx: i } as SushiGoConveyorAction)}>
                <div className="sgc-rank">{rankName(c.rank)}</div>
                <div className="sgc-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="sgc-event">
          <div className="sgc-event-line">{state.lastEvent}</div>
          <button className="sgc-next" onClick={() => dispatch({ type: "next" } as SushiGoConveyorAction)}>Next Round &raquo;</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="sgc-done">
          <h3>{state.myScore > state.cpuScore ? "Victory!" : state.myScore === state.cpuScore ? "Draw" : "Defeat"}</h3>
          <div className="sgc-final">You: {state.myScore} &middot; CPU: {state.cpuScore}</div>
          <div className="sgc-final-score">Final score: <b>{finalScore}</b></div>
        </div>
      )}
      <div className="sgc-tableaus">
        <div className="sgc-tab">
          <div className="sgc-tab-label">Your tableau</div>
          <div className="sgc-tab-row">
            {state.myTableau.map((c, i) => (
              <div key={i} className={"sgc-mini sgc-suit-" + c.suit}>
                <span className="sgc-mini-rank">{rankName(c.rank)}</span>
                <span className="sgc-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.myTableau.length === 0 && <div className="sgc-empty">(none yet)</div>}
          </div>
        </div>
        <div className="sgc-tab">
          <div className="sgc-tab-label">CPU tableau</div>
          <div className="sgc-tab-row">
            {state.cpuTableau.map((c, i) => (
              <div key={i} className={"sgc-mini sgc-suit-" + c.suit}>
                <span className="sgc-mini-rank">{rankName(c.rank)}</span>
                <span className="sgc-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.cpuTableau.length === 0 && <div className="sgc-empty">(none yet)</div>}
          </div>
        </div>
      </div>
      <div className="sgc-legend">
        Suits: {SUIT_NAMES.map((n, i) => <span key={i} className={"sgc-leg sgc-suit-" + i}>{n}</span>)}
        <span className="sgc-rule">3 same suit +10 &middot; 5 same suit +20 &middot; pair +5 &middot; trip +12</span>
      </div>
    </div>
  );
}
