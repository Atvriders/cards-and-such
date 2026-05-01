import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SevenWondersPyramidExtraState, SevenWondersPyramidExtraAction, SevenWondersPyramidExtraSettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, suitName, rankName, SUIT_NAMES } from "./state.js";
import "./Game.css";

export function SevenWondersPyramidExtraGame({ state, dispatch, onGameOver }: GameProps<SevenWondersPyramidExtraState, SevenWondersPyramidExtraSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const finalScore = score(state);
  return (
    <div className="swpe-wrap">
      <h3 className="swpe-title">Seven Wonders Pyramid Extra</h3>
      <div className="swpe-stats">
        <div className="swpe-stat"><span>Round</span><b>{state.round}/8</b></div>
        <div className="swpe-stat"><span>You</span><b>{state.myScore}</b></div>
        <div className="swpe-stat"><span>CPU</span><b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="swpe-prompt">Pick one of 4 cards. CPU takes the highest remaining.</div>
          <div className="swpe-offer">
            {state.offer.map((c, i) => (
              <button key={c.id + ":" + i} className={"swpe-card swpe-suit-" + c.suit} onClick={() => dispatch({ type: "pick", idx: i } as SevenWondersPyramidExtraAction)}>
                <div className="swpe-rank">{rankName(c.rank)}</div>
                <div className="swpe-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="swpe-event">
          <div className="swpe-event-line">{state.lastEvent}</div>
          <button className="swpe-next" onClick={() => dispatch({ type: "next" } as SevenWondersPyramidExtraAction)}>Next Round &raquo;</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="swpe-done">
          <h3>{state.myScore > state.cpuScore ? "Victory!" : state.myScore === state.cpuScore ? "Draw" : "Defeat"}</h3>
          <div className="swpe-final">You: {state.myScore} &middot; CPU: {state.cpuScore}</div>
          <div className="swpe-final-score">Final score: <b>{finalScore}</b></div>
        </div>
      )}
      <div className="swpe-tableaus">
        <div className="swpe-tab">
          <div className="swpe-tab-label">Your tableau</div>
          <div className="swpe-tab-row">
            {state.myTableau.map((c, i) => (
              <div key={i} className={"swpe-mini swpe-suit-" + c.suit}>
                <span className="swpe-mini-rank">{rankName(c.rank)}</span>
                <span className="swpe-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.myTableau.length === 0 && <div className="swpe-empty">(none yet)</div>}
          </div>
        </div>
        <div className="swpe-tab">
          <div className="swpe-tab-label">CPU tableau</div>
          <div className="swpe-tab-row">
            {state.cpuTableau.map((c, i) => (
              <div key={i} className={"swpe-mini swpe-suit-" + c.suit}>
                <span className="swpe-mini-rank">{rankName(c.rank)}</span>
                <span className="swpe-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.cpuTableau.length === 0 && <div className="swpe-empty">(none yet)</div>}
          </div>
        </div>
      </div>
      <div className="swpe-legend">
        Suits: {SUIT_NAMES.map((n, i) => <span key={i} className={"swpe-leg swpe-suit-" + i}>{n}</span>)}
        <span className="swpe-rule">3 same suit +10 &middot; 5 same suit +20 &middot; pair +5 &middot; trip +12</span>
      </div>
    </div>
  );
}
