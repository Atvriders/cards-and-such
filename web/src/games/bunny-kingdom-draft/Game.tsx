import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BunnyKingdomState, BunnyKingdomAction, BunnyKingdomSettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, suitName, rankName, SUIT_NAMES } from "./state.js";
import "./Game.css";

export function BunnyKingdomGame({ state, dispatch, onGameOver }: GameProps<BunnyKingdomState, BunnyKingdomSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const finalScore = score(state);
  return (
    <div className="bkd-wrap">
      <h3 className="bkd-title">Bunny Kingdom Draft</h3>
      <div className="bkd-stats">
        <div className="bkd-stat"><span>Round</span><b>{state.round}/8</b></div>
        <div className="bkd-stat"><span>You</span><b>{state.myScore}</b></div>
        <div className="bkd-stat"><span>CPU</span><b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="bkd-prompt">Pick one of 4 cards. CPU takes the highest remaining.</div>
          <div className="bkd-offer">
            {state.offer.map((c, i) => (
              <button key={c.id + ":" + i} className={"bkd-card bkd-suit-" + c.suit} onClick={() => dispatch({ type: "pick", idx: i } as BunnyKingdomAction)}>
                <div className="bkd-rank">{rankName(c.rank)}</div>
                <div className="bkd-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="bkd-event">
          <div className="bkd-event-line">{state.lastEvent}</div>
          <button className="bkd-next" onClick={() => dispatch({ type: "next" } as BunnyKingdomAction)}>Next Round &raquo;</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="bkd-done">
          <h3>{state.myScore > state.cpuScore ? "Victory!" : state.myScore === state.cpuScore ? "Draw" : "Defeat"}</h3>
          <div className="bkd-final">You: {state.myScore} &middot; CPU: {state.cpuScore}</div>
          <div className="bkd-final-score">Final score: <b>{finalScore}</b></div>
        </div>
      )}
      <div className="bkd-tableaus">
        <div className="bkd-tab">
          <div className="bkd-tab-label">Your tableau</div>
          <div className="bkd-tab-row">
            {state.myTableau.map((c, i) => (
              <div key={i} className={"bkd-mini bkd-suit-" + c.suit}>
                <span className="bkd-mini-rank">{rankName(c.rank)}</span>
                <span className="bkd-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.myTableau.length === 0 && <div className="bkd-empty">(none yet)</div>}
          </div>
        </div>
        <div className="bkd-tab">
          <div className="bkd-tab-label">CPU tableau</div>
          <div className="bkd-tab-row">
            {state.cpuTableau.map((c, i) => (
              <div key={i} className={"bkd-mini bkd-suit-" + c.suit}>
                <span className="bkd-mini-rank">{rankName(c.rank)}</span>
                <span className="bkd-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.cpuTableau.length === 0 && <div className="bkd-empty">(none yet)</div>}
          </div>
        </div>
      </div>
      <div className="bkd-legend">
        Suits: {SUIT_NAMES.map((n, i) => <span key={i} className={"bkd-leg bkd-suit-" + i}>{n}</span>)}
        <span className="bkd-rule">3 same suit +10 &middot; 5 same suit +20 &middot; pair +5 &middot; trip +12</span>
      </div>
    </div>
  );
}
