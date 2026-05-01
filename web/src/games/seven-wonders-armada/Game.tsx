import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SevenWondersArmadaState, SevenWondersArmadaAction, SevenWondersArmadaSettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, suitName, rankName, SUIT_NAMES } from "./state.js";
import "./Game.css";

export function SevenWondersArmadaGame({ state, dispatch, onGameOver }: GameProps<SevenWondersArmadaState, SevenWondersArmadaSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const finalScore = score(state);
  return (
    <div className="swa-wrap">
      <h3 className="swa-title">Seven Wonders: Armada</h3>
      <div className="swa-stats">
        <div className="swa-stat"><span>Round</span><b>{state.round}/9</b></div>
        <div className="swa-stat"><span>You</span><b>{state.myScore}</b></div>
        <div className="swa-stat"><span>CPU</span><b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="swa-prompt">Pick one of 4 cards. CPU takes the highest remaining.</div>
          <div className="swa-offer">
            {state.offer.map((c, i) => (
              <button key={c.id + ":" + i} className={"swa-card swa-suit-" + c.suit} onClick={() => dispatch({ type: "pick", idx: i } as SevenWondersArmadaAction)}>
                <div className="swa-rank">{rankName(c.rank)}</div>
                <div className="swa-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="swa-event">
          <div className="swa-event-line">{state.lastEvent}</div>
          <button className="swa-next" onClick={() => dispatch({ type: "next" } as SevenWondersArmadaAction)}>Next Round &raquo;</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="swa-done">
          <h3>{state.myScore > state.cpuScore ? "Victory!" : state.myScore === state.cpuScore ? "Draw" : "Defeat"}</h3>
          <div className="swa-final">You: {state.myScore} &middot; CPU: {state.cpuScore}</div>
          <div className="swa-final-score">Final score: <b>{finalScore}</b></div>
        </div>
      )}
      <div className="swa-tableaus">
        <div className="swa-tab">
          <div className="swa-tab-label">Your tableau</div>
          <div className="swa-tab-row">
            {state.myTableau.map((c, i) => (
              <div key={i} className={"swa-mini swa-suit-" + c.suit}>
                <span className="swa-mini-rank">{rankName(c.rank)}</span>
                <span className="swa-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.myTableau.length === 0 && <div className="swa-empty">(none yet)</div>}
          </div>
        </div>
        <div className="swa-tab">
          <div className="swa-tab-label">CPU tableau</div>
          <div className="swa-tab-row">
            {state.cpuTableau.map((c, i) => (
              <div key={i} className={"swa-mini swa-suit-" + c.suit}>
                <span className="swa-mini-rank">{rankName(c.rank)}</span>
                <span className="swa-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.cpuTableau.length === 0 && <div className="swa-empty">(none yet)</div>}
          </div>
        </div>
      </div>
      <div className="swa-legend">
        Suits: {SUIT_NAMES.map((n, i) => <span key={i} className={"swa-leg swa-suit-" + i}>{n}</span>)}
        <span className="swa-rule">3 same suit +10 &middot; 5 same suit +20 &middot; pair +5 &middot; trip +12</span>
      </div>
    </div>
  );
}
