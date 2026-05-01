import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AmongStarsRevivalState, AmongStarsRevivalAction, AmongStarsRevivalSettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, suitName, rankName, SUIT_NAMES } from "./state.js";
import "./Game.css";

export function AmongStarsRevivalGame({ state, dispatch, onGameOver }: GameProps<AmongStarsRevivalState, AmongStarsRevivalSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const finalScore = score(state);
  return (
    <div className="asr-wrap">
      <h3 className="asr-title">Among the Stars: Revival</h3>
      <div className="asr-stats">
        <div className="asr-stat"><span>Round</span><b>{state.round}/8</b></div>
        <div className="asr-stat"><span>You</span><b>{state.myScore}</b></div>
        <div className="asr-stat"><span>CPU</span><b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="asr-prompt">Pick one of 4 cards. CPU takes the highest remaining.</div>
          <div className="asr-offer">
            {state.offer.map((c, i) => (
              <button key={c.id + ":" + i} className={"asr-card asr-suit-" + c.suit} onClick={() => dispatch({ type: "pick", idx: i } as AmongStarsRevivalAction)}>
                <div className="asr-rank">{rankName(c.rank)}</div>
                <div className="asr-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="asr-event">
          <div className="asr-event-line">{state.lastEvent}</div>
          <button className="asr-next" onClick={() => dispatch({ type: "next" } as AmongStarsRevivalAction)}>Next Round &raquo;</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="asr-done">
          <h3>{state.myScore > state.cpuScore ? "Victory!" : state.myScore === state.cpuScore ? "Draw" : "Defeat"}</h3>
          <div className="asr-final">You: {state.myScore} &middot; CPU: {state.cpuScore}</div>
          <div className="asr-final-score">Final score: <b>{finalScore}</b></div>
        </div>
      )}
      <div className="asr-tableaus">
        <div className="asr-tab">
          <div className="asr-tab-label">Your tableau</div>
          <div className="asr-tab-row">
            {state.myTableau.map((c, i) => (
              <div key={i} className={"asr-mini asr-suit-" + c.suit}>
                <span className="asr-mini-rank">{rankName(c.rank)}</span>
                <span className="asr-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.myTableau.length === 0 && <div className="asr-empty">(none yet)</div>}
          </div>
        </div>
        <div className="asr-tab">
          <div className="asr-tab-label">CPU tableau</div>
          <div className="asr-tab-row">
            {state.cpuTableau.map((c, i) => (
              <div key={i} className={"asr-mini asr-suit-" + c.suit}>
                <span className="asr-mini-rank">{rankName(c.rank)}</span>
                <span className="asr-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.cpuTableau.length === 0 && <div className="asr-empty">(none yet)</div>}
          </div>
        </div>
      </div>
      <div className="asr-legend">
        Suits: {SUIT_NAMES.map((n, i) => <span key={i} className={"asr-leg asr-suit-" + i}>{n}</span>)}
        <span className="asr-rule">3 same suit +10 &middot; 5 same suit +20 &middot; pair +5 &middot; trip +12</span>
      </div>
    </div>
  );
}
