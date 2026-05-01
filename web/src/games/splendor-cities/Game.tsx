import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SplendorCitiesState, SplendorCitiesAction, SplendorCitiesSettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, suitName, rankName, SUIT_NAMES } from "./state.js";
import "./Game.css";

export function SplendorCitiesGame({ state, dispatch, onGameOver }: GameProps<SplendorCitiesState, SplendorCitiesSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const finalScore = score(state);
  return (
    <div className="spc-wrap">
      <h3 className="spc-title">Splendor: Cities</h3>
      <div className="spc-stats">
        <div className="spc-stat"><span>Round</span><b>{state.round}/9</b></div>
        <div className="spc-stat"><span>You</span><b>{state.myScore}</b></div>
        <div className="spc-stat"><span>CPU</span><b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="spc-prompt">Pick one of 4 cards. CPU takes the highest remaining.</div>
          <div className="spc-offer">
            {state.offer.map((c, i) => (
              <button key={c.id + ":" + i} className={"spc-card spc-suit-" + c.suit} onClick={() => dispatch({ type: "pick", idx: i } as SplendorCitiesAction)}>
                <div className="spc-rank">{rankName(c.rank)}</div>
                <div className="spc-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="spc-event">
          <div className="spc-event-line">{state.lastEvent}</div>
          <button className="spc-next" onClick={() => dispatch({ type: "next" } as SplendorCitiesAction)}>Next Round &raquo;</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="spc-done">
          <h3>{state.myScore > state.cpuScore ? "Victory!" : state.myScore === state.cpuScore ? "Draw" : "Defeat"}</h3>
          <div className="spc-final">You: {state.myScore} &middot; CPU: {state.cpuScore}</div>
          <div className="spc-final-score">Final score: <b>{finalScore}</b></div>
        </div>
      )}
      <div className="spc-tableaus">
        <div className="spc-tab">
          <div className="spc-tab-label">Your tableau</div>
          <div className="spc-tab-row">
            {state.myTableau.map((c, i) => (
              <div key={i} className={"spc-mini spc-suit-" + c.suit}>
                <span className="spc-mini-rank">{rankName(c.rank)}</span>
                <span className="spc-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.myTableau.length === 0 && <div className="spc-empty">(none yet)</div>}
          </div>
        </div>
        <div className="spc-tab">
          <div className="spc-tab-label">CPU tableau</div>
          <div className="spc-tab-row">
            {state.cpuTableau.map((c, i) => (
              <div key={i} className={"spc-mini spc-suit-" + c.suit}>
                <span className="spc-mini-rank">{rankName(c.rank)}</span>
                <span className="spc-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.cpuTableau.length === 0 && <div className="spc-empty">(none yet)</div>}
          </div>
        </div>
      </div>
      <div className="spc-legend">
        Suits: {SUIT_NAMES.map((n, i) => <span key={i} className={"spc-leg spc-suit-" + i}>{n}</span>)}
        <span className="spc-rule">3 same suit +10 &middot; 5 same suit +20 &middot; pair +5 &middot; trip +12</span>
      </div>
    </div>
  );
}
