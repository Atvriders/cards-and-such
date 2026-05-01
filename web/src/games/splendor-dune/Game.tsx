import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SplendorDuneState, SplendorDuneAction, SplendorDuneSettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, suitName, rankName, SUIT_NAMES } from "./state.js";
import "./Game.css";

export function SplendorDuneGame({ state, dispatch, onGameOver }: GameProps<SplendorDuneState, SplendorDuneSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const finalScore = score(state);
  return (
    <div className="spd-wrap">
      <h3 className="spd-title">Splendor: Dune</h3>
      <div className="spd-stats">
        <div className="spd-stat"><span>Round</span><b>{state.round}/9</b></div>
        <div className="spd-stat"><span>You</span><b>{state.myScore}</b></div>
        <div className="spd-stat"><span>CPU</span><b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="spd-prompt">Pick one of 4 cards. CPU takes the highest remaining.</div>
          <div className="spd-offer">
            {state.offer.map((c, i) => (
              <button key={c.id + ":" + i} className={"spd-card spd-suit-" + c.suit} onClick={() => dispatch({ type: "pick", idx: i } as SplendorDuneAction)}>
                <div className="spd-rank">{rankName(c.rank)}</div>
                <div className="spd-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="spd-event">
          <div className="spd-event-line">{state.lastEvent}</div>
          <button className="spd-next" onClick={() => dispatch({ type: "next" } as SplendorDuneAction)}>Next Round &raquo;</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="spd-done">
          <h3>{state.myScore > state.cpuScore ? "Victory!" : state.myScore === state.cpuScore ? "Draw" : "Defeat"}</h3>
          <div className="spd-final">You: {state.myScore} &middot; CPU: {state.cpuScore}</div>
          <div className="spd-final-score">Final score: <b>{finalScore}</b></div>
        </div>
      )}
      <div className="spd-tableaus">
        <div className="spd-tab">
          <div className="spd-tab-label">Your tableau</div>
          <div className="spd-tab-row">
            {state.myTableau.map((c, i) => (
              <div key={i} className={"spd-mini spd-suit-" + c.suit}>
                <span className="spd-mini-rank">{rankName(c.rank)}</span>
                <span className="spd-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.myTableau.length === 0 && <div className="spd-empty">(none yet)</div>}
          </div>
        </div>
        <div className="spd-tab">
          <div className="spd-tab-label">CPU tableau</div>
          <div className="spd-tab-row">
            {state.cpuTableau.map((c, i) => (
              <div key={i} className={"spd-mini spd-suit-" + c.suit}>
                <span className="spd-mini-rank">{rankName(c.rank)}</span>
                <span className="spd-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.cpuTableau.length === 0 && <div className="spd-empty">(none yet)</div>}
          </div>
        </div>
      </div>
      <div className="spd-legend">
        Suits: {SUIT_NAMES.map((n, i) => <span key={i} className={"spd-leg spd-suit-" + i}>{n}</span>)}
        <span className="spd-rule">3 same suit +10 &middot; 5 same suit +20 &middot; pair +5 &middot; trip +12</span>
      </div>
    </div>
  );
}
