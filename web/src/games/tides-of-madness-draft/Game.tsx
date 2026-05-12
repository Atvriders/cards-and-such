import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TidesOfMadnessDraftState, TidesOfMadnessDraftAction, TidesOfMadnessDraftSettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, suitName, rankName, SUIT_NAMES } from "./state.js";
import "./Game.css";

export function TidesOfMadnessDraftGame({ state, dispatch, onGameOver }: GameProps<TidesOfMadnessDraftState, TidesOfMadnessDraftSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const finalScore = score(state);
  return (
    <div className="tmd-wrap fade-in">
      <h3 className="tmd-title">Tides of Madness</h3>
      <div className="tmd-stats">
        <div className="tmd-stat"><span>Round</span><b>{state.round}/6</b></div>
        <div className="tmd-stat"><span>You</span><b>{state.myScore}</b></div>
        <div className="tmd-stat"><span>CPU</span><b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="tmd-prompt">Pick one of 4 cards. CPU takes the highest remaining.</div>
          <div className="tmd-offer">
            {state.offer.map((c, i) => (
              <button key={c.id + ":" + i} className={"tmd-card tmd-suit-" + c.suit} onClick={() => dispatch({ type: "pick", idx: i } as TidesOfMadnessDraftAction)}>
                <div className="tmd-rank">{rankName(c.rank)}</div>
                <div className="tmd-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="tmd-event">
          <div className="tmd-event-line">{state.lastEvent}</div>
          <button className="tmd-next" onClick={() => dispatch({ type: "next" } as TidesOfMadnessDraftAction)}>Next Round &raquo;</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="tmd-done bounce-in">
          <h3>{state.myScore > state.cpuScore ? "Victory!" : state.myScore === state.cpuScore ? "Draw" : "Defeat"}</h3>
          <div className="tmd-final">You: {state.myScore} &middot; CPU: {state.cpuScore}</div>
          <div className="tmd-final-score">Final score: <b>{finalScore}</b></div>
        </div>
      )}
      <div className="tmd-tableaus">
        <div className="tmd-tab">
          <div className="tmd-tab-label">Your tableau</div>
          <div className="tmd-tab-row">
            {state.myTableau.map((c, i) => (
              <div key={i} className={"tmd-mini tmd-suit-" + c.suit}>
                <span className="tmd-mini-rank">{rankName(c.rank)}</span>
                <span className="tmd-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.myTableau.length === 0 && <div className="tmd-empty">(none yet)</div>}
          </div>
        </div>
        <div className="tmd-tab">
          <div className="tmd-tab-label">CPU tableau</div>
          <div className="tmd-tab-row">
            {state.cpuTableau.map((c, i) => (
              <div key={i} className={"tmd-mini tmd-suit-" + c.suit}>
                <span className="tmd-mini-rank">{rankName(c.rank)}</span>
                <span className="tmd-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.cpuTableau.length === 0 && <div className="tmd-empty">(none yet)</div>}
          </div>
        </div>
      </div>
      <div className="tmd-legend">
        Suits: {SUIT_NAMES.map((n, i) => <span key={i} className={"tmd-leg tmd-suit-" + i}>{n}</span>)}
        <span className="tmd-rule">3 same suit +10 &middot; 5 same suit +20 &middot; pair +5 &middot; trip +12</span>
      </div>
    </div>
  );
}
