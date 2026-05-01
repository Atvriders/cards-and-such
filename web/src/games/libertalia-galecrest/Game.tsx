import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LibertaliaGalecrestState, LibertaliaGalecrestAction, LibertaliaGalecrestSettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, suitName, rankName, SUIT_NAMES } from "./state.js";
import "./Game.css";

export function LibertaliaGalecrestGame({ state, dispatch, onGameOver }: GameProps<LibertaliaGalecrestState, LibertaliaGalecrestSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const finalScore = score(state);
  return (
    <div className="lbg-wrap">
      <h3 className="lbg-title">Libertalia: Galecrest</h3>
      <div className="lbg-stats">
        <div className="lbg-stat"><span>Round</span><b>{state.round}/8</b></div>
        <div className="lbg-stat"><span>You</span><b>{state.myScore}</b></div>
        <div className="lbg-stat"><span>CPU</span><b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="lbg-prompt">Pick one of 4 cards. CPU takes the highest remaining.</div>
          <div className="lbg-offer">
            {state.offer.map((c, i) => (
              <button key={c.id + ":" + i} className={"lbg-card lbg-suit-" + c.suit} onClick={() => dispatch({ type: "pick", idx: i } as LibertaliaGalecrestAction)}>
                <div className="lbg-rank">{rankName(c.rank)}</div>
                <div className="lbg-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="lbg-event">
          <div className="lbg-event-line">{state.lastEvent}</div>
          <button className="lbg-next" onClick={() => dispatch({ type: "next" } as LibertaliaGalecrestAction)}>Next Round &raquo;</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="lbg-done">
          <h3>{state.myScore > state.cpuScore ? "Victory!" : state.myScore === state.cpuScore ? "Draw" : "Defeat"}</h3>
          <div className="lbg-final">You: {state.myScore} &middot; CPU: {state.cpuScore}</div>
          <div className="lbg-final-score">Final score: <b>{finalScore}</b></div>
        </div>
      )}
      <div className="lbg-tableaus">
        <div className="lbg-tab">
          <div className="lbg-tab-label">Your tableau</div>
          <div className="lbg-tab-row">
            {state.myTableau.map((c, i) => (
              <div key={i} className={"lbg-mini lbg-suit-" + c.suit}>
                <span className="lbg-mini-rank">{rankName(c.rank)}</span>
                <span className="lbg-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.myTableau.length === 0 && <div className="lbg-empty">(none yet)</div>}
          </div>
        </div>
        <div className="lbg-tab">
          <div className="lbg-tab-label">CPU tableau</div>
          <div className="lbg-tab-row">
            {state.cpuTableau.map((c, i) => (
              <div key={i} className={"lbg-mini lbg-suit-" + c.suit}>
                <span className="lbg-mini-rank">{rankName(c.rank)}</span>
                <span className="lbg-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.cpuTableau.length === 0 && <div className="lbg-empty">(none yet)</div>}
          </div>
        </div>
      </div>
      <div className="lbg-legend">
        Suits: {SUIT_NAMES.map((n, i) => <span key={i} className={"lbg-leg lbg-suit-" + i}>{n}</span>)}
        <span className="lbg-rule">3 same suit +10 &middot; 5 same suit +20 &middot; pair +5 &middot; trip +12</span>
      </div>
    </div>
  );
}
