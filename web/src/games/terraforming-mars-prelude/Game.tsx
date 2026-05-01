import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TerraformingMarsPreludeState, TerraformingMarsPreludeAction, TerraformingMarsPreludeSettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, suitName, rankName, SUIT_NAMES } from "./state.js";
import "./Game.css";

export function TerraformingMarsPreludeGame({ state, dispatch, onGameOver }: GameProps<TerraformingMarsPreludeState, TerraformingMarsPreludeSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const finalScore = score(state);
  return (
    <div className="tmp-wrap">
      <h3 className="tmp-title">Terraforming Mars: Prelude</h3>
      <div className="tmp-stats">
        <div className="tmp-stat"><span>Round</span><b>{state.round}/10</b></div>
        <div className="tmp-stat"><span>You</span><b>{state.myScore}</b></div>
        <div className="tmp-stat"><span>CPU</span><b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="tmp-prompt">Pick one of 4 cards. CPU takes the highest remaining.</div>
          <div className="tmp-offer">
            {state.offer.map((c, i) => (
              <button key={c.id + ":" + i} className={"tmp-card tmp-suit-" + c.suit} onClick={() => dispatch({ type: "pick", idx: i } as TerraformingMarsPreludeAction)}>
                <div className="tmp-rank">{rankName(c.rank)}</div>
                <div className="tmp-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="tmp-event">
          <div className="tmp-event-line">{state.lastEvent}</div>
          <button className="tmp-next" onClick={() => dispatch({ type: "next" } as TerraformingMarsPreludeAction)}>Next Round &raquo;</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="tmp-done">
          <h3>{state.myScore > state.cpuScore ? "Victory!" : state.myScore === state.cpuScore ? "Draw" : "Defeat"}</h3>
          <div className="tmp-final">You: {state.myScore} &middot; CPU: {state.cpuScore}</div>
          <div className="tmp-final-score">Final score: <b>{finalScore}</b></div>
        </div>
      )}
      <div className="tmp-tableaus">
        <div className="tmp-tab">
          <div className="tmp-tab-label">Your tableau</div>
          <div className="tmp-tab-row">
            {state.myTableau.map((c, i) => (
              <div key={i} className={"tmp-mini tmp-suit-" + c.suit}>
                <span className="tmp-mini-rank">{rankName(c.rank)}</span>
                <span className="tmp-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.myTableau.length === 0 && <div className="tmp-empty">(none yet)</div>}
          </div>
        </div>
        <div className="tmp-tab">
          <div className="tmp-tab-label">CPU tableau</div>
          <div className="tmp-tab-row">
            {state.cpuTableau.map((c, i) => (
              <div key={i} className={"tmp-mini tmp-suit-" + c.suit}>
                <span className="tmp-mini-rank">{rankName(c.rank)}</span>
                <span className="tmp-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.cpuTableau.length === 0 && <div className="tmp-empty">(none yet)</div>}
          </div>
        </div>
      </div>
      <div className="tmp-legend">
        Suits: {SUIT_NAMES.map((n, i) => <span key={i} className={"tmp-leg tmp-suit-" + i}>{n}</span>)}
        <span className="tmp-rule">3 same suit +10 &middot; 5 same suit +20 &middot; pair +5 &middot; trip +12</span>
      </div>
    </div>
  );
}
