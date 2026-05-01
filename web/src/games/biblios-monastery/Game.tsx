import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BibliosMonasteryState, BibliosMonasteryAction, BibliosMonasterySettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, suitName, rankName, SUIT_NAMES } from "./state.js";
import "./Game.css";

export function BibliosMonasteryGame({ state, dispatch, onGameOver }: GameProps<BibliosMonasteryState, BibliosMonasterySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const finalScore = score(state);
  return (
    <div className="bbm-wrap">
      <h3 className="bbm-title">Biblios: Monastery</h3>
      <div className="bbm-stats">
        <div className="bbm-stat"><span>Round</span><b>{state.round}/8</b></div>
        <div className="bbm-stat"><span>You</span><b>{state.myScore}</b></div>
        <div className="bbm-stat"><span>CPU</span><b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="bbm-prompt">Pick one of 4 cards. CPU takes the highest remaining.</div>
          <div className="bbm-offer">
            {state.offer.map((c, i) => (
              <button key={c.id + ":" + i} className={"bbm-card bbm-suit-" + c.suit} onClick={() => dispatch({ type: "pick", idx: i } as BibliosMonasteryAction)}>
                <div className="bbm-rank">{rankName(c.rank)}</div>
                <div className="bbm-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="bbm-event">
          <div className="bbm-event-line">{state.lastEvent}</div>
          <button className="bbm-next" onClick={() => dispatch({ type: "next" } as BibliosMonasteryAction)}>Next Round &raquo;</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="bbm-done">
          <h3>{state.myScore > state.cpuScore ? "Victory!" : state.myScore === state.cpuScore ? "Draw" : "Defeat"}</h3>
          <div className="bbm-final">You: {state.myScore} &middot; CPU: {state.cpuScore}</div>
          <div className="bbm-final-score">Final score: <b>{finalScore}</b></div>
        </div>
      )}
      <div className="bbm-tableaus">
        <div className="bbm-tab">
          <div className="bbm-tab-label">Your tableau</div>
          <div className="bbm-tab-row">
            {state.myTableau.map((c, i) => (
              <div key={i} className={"bbm-mini bbm-suit-" + c.suit}>
                <span className="bbm-mini-rank">{rankName(c.rank)}</span>
                <span className="bbm-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.myTableau.length === 0 && <div className="bbm-empty">(none yet)</div>}
          </div>
        </div>
        <div className="bbm-tab">
          <div className="bbm-tab-label">CPU tableau</div>
          <div className="bbm-tab-row">
            {state.cpuTableau.map((c, i) => (
              <div key={i} className={"bbm-mini bbm-suit-" + c.suit}>
                <span className="bbm-mini-rank">{rankName(c.rank)}</span>
                <span className="bbm-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.cpuTableau.length === 0 && <div className="bbm-empty">(none yet)</div>}
          </div>
        </div>
      </div>
      <div className="bbm-legend">
        Suits: {SUIT_NAMES.map((n, i) => <span key={i} className={"bbm-leg bbm-suit-" + i}>{n}</span>)}
        <span className="bbm-rule">3 same suit +10 &middot; 5 same suit +20 &middot; pair +5 &middot; trip +12</span>
      </div>
    </div>
  );
}
