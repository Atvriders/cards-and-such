import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BibliosTomesState, BibliosTomesAction, BibliosTomesSettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, suitName, rankName, SUIT_NAMES } from "./state.js";
import "./Game.css";

export function BibliosTomesGame({ state, dispatch, onGameOver }: GameProps<BibliosTomesState, BibliosTomesSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const finalScore = score(state);
  return (
    <div className="bbt-wrap">
      <h3 className="bbt-title">Biblios: Tomes</h3>
      <div className="bbt-stats">
        <div className="bbt-stat"><span>Round</span><b>{state.round}/8</b></div>
        <div className="bbt-stat"><span>You</span><b>{state.myScore}</b></div>
        <div className="bbt-stat"><span>CPU</span><b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="bbt-prompt">Pick one of 3 cards. CPU takes the highest remaining.</div>
          <div className="bbt-offer">
            {state.offer.map((c, i) => (
              <button key={c.id + ":" + i} className={"bbt-card bbt-suit-" + c.suit} onClick={() => dispatch({ type: "pick", idx: i } as BibliosTomesAction)}>
                <div className="bbt-rank">{rankName(c.rank)}</div>
                <div className="bbt-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="bbt-event">
          <div className="bbt-event-line">{state.lastEvent}</div>
          <button className="bbt-next" onClick={() => dispatch({ type: "next" } as BibliosTomesAction)}>Next Round &raquo;</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="bbt-done">
          <h3>{state.myScore > state.cpuScore ? "Victory!" : state.myScore === state.cpuScore ? "Draw" : "Defeat"}</h3>
          <div className="bbt-final">You: {state.myScore} &middot; CPU: {state.cpuScore}</div>
          <div className="bbt-final-score">Final score: <b>{finalScore}</b></div>
        </div>
      )}
      <div className="bbt-tableaus">
        <div className="bbt-tab">
          <div className="bbt-tab-label">Your tableau</div>
          <div className="bbt-tab-row">
            {state.myTableau.map((c, i) => (
              <div key={i} className={"bbt-mini bbt-suit-" + c.suit}>
                <span className="bbt-mini-rank">{rankName(c.rank)}</span>
                <span className="bbt-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.myTableau.length === 0 && <div className="bbt-empty">(none yet)</div>}
          </div>
        </div>
        <div className="bbt-tab">
          <div className="bbt-tab-label">CPU tableau</div>
          <div className="bbt-tab-row">
            {state.cpuTableau.map((c, i) => (
              <div key={i} className={"bbt-mini bbt-suit-" + c.suit}>
                <span className="bbt-mini-rank">{rankName(c.rank)}</span>
                <span className="bbt-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.cpuTableau.length === 0 && <div className="bbt-empty">(none yet)</div>}
          </div>
        </div>
      </div>
      <div className="bbt-legend">
        Suits: {SUIT_NAMES.map((n, i) => <span key={i} className={"bbt-leg bbt-suit-" + i}>{n}</span>)}
        <span className="bbt-rule">3 same suit +10 &middot; 5 same suit +20 &middot; pair +5 &middot; trip +12</span>
      </div>
    </div>
  );
}
