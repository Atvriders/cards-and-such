import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DuelAgoraSenateState, DuelAgoraSenateAction, DuelAgoraSenateSettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, suitName, rankName, SUIT_NAMES } from "./state.js";
import "./Game.css";

export function DuelAgoraSenateGame({ state, dispatch, onGameOver }: GameProps<DuelAgoraSenateState, DuelAgoraSenateSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const finalScore = score(state);
  return (
    <div className="das-wrap">
      <h3 className="das-title">7 Wonders Duel: Agora</h3>
      <div className="das-stats">
        <div className="das-stat"><span>Round</span><b>{state.round}/8</b></div>
        <div className="das-stat"><span>You</span><b>{state.myScore}</b></div>
        <div className="das-stat"><span>CPU</span><b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="das-prompt">Pick one of 3 cards. CPU takes the highest remaining.</div>
          <div className="das-offer">
            {state.offer.map((c, i) => (
              <button key={c.id + ":" + i} className={"das-card das-suit-" + c.suit} onClick={() => dispatch({ type: "pick", idx: i } as DuelAgoraSenateAction)}>
                <div className="das-rank">{rankName(c.rank)}</div>
                <div className="das-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="das-event">
          <div className="das-event-line">{state.lastEvent}</div>
          <button className="das-next" onClick={() => dispatch({ type: "next" } as DuelAgoraSenateAction)}>Next Round &raquo;</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="das-done">
          <h3>{state.myScore > state.cpuScore ? "Victory!" : state.myScore === state.cpuScore ? "Draw" : "Defeat"}</h3>
          <div className="das-final">You: {state.myScore} &middot; CPU: {state.cpuScore}</div>
          <div className="das-final-score">Final score: <b>{finalScore}</b></div>
        </div>
      )}
      <div className="das-tableaus">
        <div className="das-tab">
          <div className="das-tab-label">Your tableau</div>
          <div className="das-tab-row">
            {state.myTableau.map((c, i) => (
              <div key={i} className={"das-mini das-suit-" + c.suit}>
                <span className="das-mini-rank">{rankName(c.rank)}</span>
                <span className="das-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.myTableau.length === 0 && <div className="das-empty">(none yet)</div>}
          </div>
        </div>
        <div className="das-tab">
          <div className="das-tab-label">CPU tableau</div>
          <div className="das-tab-row">
            {state.cpuTableau.map((c, i) => (
              <div key={i} className={"das-mini das-suit-" + c.suit}>
                <span className="das-mini-rank">{rankName(c.rank)}</span>
                <span className="das-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.cpuTableau.length === 0 && <div className="das-empty">(none yet)</div>}
          </div>
        </div>
      </div>
      <div className="das-legend">
        Suits: {SUIT_NAMES.map((n, i) => <span key={i} className={"das-leg das-suit-" + i}>{n}</span>)}
        <span className="das-rule">3 same suit +10 &middot; 5 same suit +20 &middot; pair +5 &middot; trip +12</span>
      </div>
    </div>
  );
}
