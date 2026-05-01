import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SevenWondersCitiesState, SevenWondersCitiesAction, SevenWondersCitiesSettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, suitName, rankName, SUIT_NAMES } from "./state.js";
import "./Game.css";

export function SevenWondersCitiesGame({ state, dispatch, onGameOver }: GameProps<SevenWondersCitiesState, SevenWondersCitiesSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const finalScore = score(state);
  return (
    <div className="swc-wrap">
      <h3 className="swc-title">Seven Wonders: Cities</h3>
      <div className="swc-stats">
        <div className="swc-stat"><span>Round</span><b>{state.round}/9</b></div>
        <div className="swc-stat"><span>You</span><b>{state.myScore}</b></div>
        <div className="swc-stat"><span>CPU</span><b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="swc-prompt">Pick one of 3 cards. CPU takes the highest remaining.</div>
          <div className="swc-offer">
            {state.offer.map((c, i) => (
              <button key={c.id + ":" + i} className={"swc-card swc-suit-" + c.suit} onClick={() => dispatch({ type: "pick", idx: i } as SevenWondersCitiesAction)}>
                <div className="swc-rank">{rankName(c.rank)}</div>
                <div className="swc-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="swc-event">
          <div className="swc-event-line">{state.lastEvent}</div>
          <button className="swc-next" onClick={() => dispatch({ type: "next" } as SevenWondersCitiesAction)}>Next Round &raquo;</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="swc-done">
          <h3>{state.myScore > state.cpuScore ? "Victory!" : state.myScore === state.cpuScore ? "Draw" : "Defeat"}</h3>
          <div className="swc-final">You: {state.myScore} &middot; CPU: {state.cpuScore}</div>
          <div className="swc-final-score">Final score: <b>{finalScore}</b></div>
        </div>
      )}
      <div className="swc-tableaus">
        <div className="swc-tab">
          <div className="swc-tab-label">Your tableau</div>
          <div className="swc-tab-row">
            {state.myTableau.map((c, i) => (
              <div key={i} className={"swc-mini swc-suit-" + c.suit}>
                <span className="swc-mini-rank">{rankName(c.rank)}</span>
                <span className="swc-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.myTableau.length === 0 && <div className="swc-empty">(none yet)</div>}
          </div>
        </div>
        <div className="swc-tab">
          <div className="swc-tab-label">CPU tableau</div>
          <div className="swc-tab-row">
            {state.cpuTableau.map((c, i) => (
              <div key={i} className={"swc-mini swc-suit-" + c.suit}>
                <span className="swc-mini-rank">{rankName(c.rank)}</span>
                <span className="swc-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.cpuTableau.length === 0 && <div className="swc-empty">(none yet)</div>}
          </div>
        </div>
      </div>
      <div className="swc-legend">
        Suits: {SUIT_NAMES.map((n, i) => <span key={i} className={"swc-leg swc-suit-" + i}>{n}</span>)}
        <span className="swc-rule">3 same suit +10 &middot; 5 same suit +20 &middot; pair +5 &middot; trip +12</span>
      </div>
    </div>
  );
}
