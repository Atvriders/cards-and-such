import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SushiGoDeluxeState, SushiGoDeluxeAction, SushiGoDeluxeSettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, suitName, rankName, SUIT_NAMES } from "./state.js";
import "./Game.css";

export function SushiGoDeluxeGame({ state, dispatch, onGameOver }: GameProps<SushiGoDeluxeState, SushiGoDeluxeSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const finalScore = score(state);
  return (
    <div className="sgd-wrap">
      <h3 className="sgd-title">Sushi Go Deluxe</h3>
      <div className="sgd-stats">
        <div className="sgd-stat"><span>Round</span><b>{state.round}/9</b></div>
        <div className="sgd-stat"><span>You</span><b>{state.myScore}</b></div>
        <div className="sgd-stat"><span>CPU</span><b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="sgd-prompt">Pick one of 4 cards. CPU takes the highest remaining.</div>
          <div className="sgd-offer">
            {state.offer.map((c, i) => (
              <button key={c.id + ":" + i} className={"sgd-card sgd-suit-" + c.suit} onClick={() => dispatch({ type: "pick", idx: i } as SushiGoDeluxeAction)}>
                <div className="sgd-rank">{rankName(c.rank)}</div>
                <div className="sgd-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="sgd-event">
          <div className="sgd-event-line">{state.lastEvent}</div>
          <button className="sgd-next" onClick={() => dispatch({ type: "next" } as SushiGoDeluxeAction)}>Next Round &raquo;</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="sgd-done">
          <h3>{state.myScore > state.cpuScore ? "Victory!" : state.myScore === state.cpuScore ? "Draw" : "Defeat"}</h3>
          <div className="sgd-final">You: {state.myScore} &middot; CPU: {state.cpuScore}</div>
          <div className="sgd-final-score">Final score: <b>{finalScore}</b></div>
        </div>
      )}
      <div className="sgd-tableaus">
        <div className="sgd-tab">
          <div className="sgd-tab-label">Your tableau</div>
          <div className="sgd-tab-row">
            {state.myTableau.map((c, i) => (
              <div key={i} className={"sgd-mini sgd-suit-" + c.suit}>
                <span className="sgd-mini-rank">{rankName(c.rank)}</span>
                <span className="sgd-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.myTableau.length === 0 && <div className="sgd-empty">(none yet)</div>}
          </div>
        </div>
        <div className="sgd-tab">
          <div className="sgd-tab-label">CPU tableau</div>
          <div className="sgd-tab-row">
            {state.cpuTableau.map((c, i) => (
              <div key={i} className={"sgd-mini sgd-suit-" + c.suit}>
                <span className="sgd-mini-rank">{rankName(c.rank)}</span>
                <span className="sgd-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.cpuTableau.length === 0 && <div className="sgd-empty">(none yet)</div>}
          </div>
        </div>
      </div>
      <div className="sgd-legend">
        Suits: {SUIT_NAMES.map((n, i) => <span key={i} className={"sgd-leg sgd-suit-" + i}>{n}</span>)}
        <span className="sgd-rule">3 same suit +10 &middot; 5 same suit +20 &middot; pair +5 &middot; trip +12</span>
      </div>
    </div>
  );
}
