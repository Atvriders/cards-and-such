import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SplendorGemsState, SplendorGemsAction, SplendorGemsSettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, suitName, rankName, SUIT_NAMES } from "./state.js";
import "./Game.css";

export function SplendorGemsGame({ state, dispatch, onGameOver }: GameProps<SplendorGemsState, SplendorGemsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const finalScore = score(state);
  return (
    <div className="spg-wrap">
      <h3 className="spg-title">Splendor Gems</h3>
      <div className="spg-stats">
        <div className="spg-stat"><span>Round</span><b>{state.round}/8</b></div>
        <div className="spg-stat"><span>You</span><b>{state.myScore}</b></div>
        <div className="spg-stat"><span>CPU</span><b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="spg-prompt">Pick one of 4 cards. CPU takes the highest remaining.</div>
          <div className="spg-offer">
            {state.offer.map((c, i) => (
              <button key={c.id + ":" + i} className={"spg-card spg-suit-" + c.suit} onClick={() => dispatch({ type: "pick", idx: i } as SplendorGemsAction)}>
                <div className="spg-rank">{rankName(c.rank)}</div>
                <div className="spg-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="spg-event">
          <div className="spg-event-line">{state.lastEvent}</div>
          <button className="spg-next" onClick={() => dispatch({ type: "next" } as SplendorGemsAction)}>Next Round &raquo;</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="spg-done">
          <h3>{state.myScore > state.cpuScore ? "Victory!" : state.myScore === state.cpuScore ? "Draw" : "Defeat"}</h3>
          <div className="spg-final">You: {state.myScore} &middot; CPU: {state.cpuScore}</div>
          <div className="spg-final-score">Final score: <b>{finalScore}</b></div>
        </div>
      )}
      <div className="spg-tableaus">
        <div className="spg-tab">
          <div className="spg-tab-label">Your tableau</div>
          <div className="spg-tab-row">
            {state.myTableau.map((c, i) => (
              <div key={i} className={"spg-mini spg-suit-" + c.suit}>
                <span className="spg-mini-rank">{rankName(c.rank)}</span>
                <span className="spg-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.myTableau.length === 0 && <div className="spg-empty">(none yet)</div>}
          </div>
        </div>
        <div className="spg-tab">
          <div className="spg-tab-label">CPU tableau</div>
          <div className="spg-tab-row">
            {state.cpuTableau.map((c, i) => (
              <div key={i} className={"spg-mini spg-suit-" + c.suit}>
                <span className="spg-mini-rank">{rankName(c.rank)}</span>
                <span className="spg-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.cpuTableau.length === 0 && <div className="spg-empty">(none yet)</div>}
          </div>
        </div>
      </div>
      <div className="spg-legend">
        Suits: {SUIT_NAMES.map((n, i) => <span key={i} className={"spg-leg spg-suit-" + i}>{n}</span>)}
        <span className="spg-rule">3 same suit +10 &middot; 5 same suit +20 &middot; pair +5 &middot; trip +12</span>
      </div>
    </div>
  );
}
