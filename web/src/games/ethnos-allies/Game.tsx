import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { EthnosAlliesState, EthnosAlliesAction, EthnosAlliesSettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, suitName, rankName, SUIT_NAMES } from "./state.js";
import "./Game.css";

export function EthnosAlliesGame({ state, dispatch, onGameOver }: GameProps<EthnosAlliesState, EthnosAlliesSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const finalScore = score(state);
  return (
    <div className="eta-wrap">
      <h3 className="eta-title">Ethnos: Allies</h3>
      <div className="eta-stats">
        <div className="eta-stat"><span>Round</span><b>{state.round}/9</b></div>
        <div className="eta-stat"><span>You</span><b>{state.myScore}</b></div>
        <div className="eta-stat"><span>CPU</span><b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="eta-prompt">Pick one of 4 cards. CPU takes the highest remaining.</div>
          <div className="eta-offer">
            {state.offer.map((c, i) => (
              <button key={c.id + ":" + i} className={"eta-card eta-suit-" + c.suit} onClick={() => dispatch({ type: "pick", idx: i } as EthnosAlliesAction)}>
                <div className="eta-rank">{rankName(c.rank)}</div>
                <div className="eta-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="eta-event">
          <div className="eta-event-line">{state.lastEvent}</div>
          <button className="eta-next" onClick={() => dispatch({ type: "next" } as EthnosAlliesAction)}>Next Round &raquo;</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="eta-done">
          <h3>{state.myScore > state.cpuScore ? "Victory!" : state.myScore === state.cpuScore ? "Draw" : "Defeat"}</h3>
          <div className="eta-final">You: {state.myScore} &middot; CPU: {state.cpuScore}</div>
          <div className="eta-final-score">Final score: <b>{finalScore}</b></div>
        </div>
      )}
      <div className="eta-tableaus">
        <div className="eta-tab">
          <div className="eta-tab-label">Your tableau</div>
          <div className="eta-tab-row">
            {state.myTableau.map((c, i) => (
              <div key={i} className={"eta-mini eta-suit-" + c.suit}>
                <span className="eta-mini-rank">{rankName(c.rank)}</span>
                <span className="eta-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.myTableau.length === 0 && <div className="eta-empty">(none yet)</div>}
          </div>
        </div>
        <div className="eta-tab">
          <div className="eta-tab-label">CPU tableau</div>
          <div className="eta-tab-row">
            {state.cpuTableau.map((c, i) => (
              <div key={i} className={"eta-mini eta-suit-" + c.suit}>
                <span className="eta-mini-rank">{rankName(c.rank)}</span>
                <span className="eta-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.cpuTableau.length === 0 && <div className="eta-empty">(none yet)</div>}
          </div>
        </div>
      </div>
      <div className="eta-legend">
        Suits: {SUIT_NAMES.map((n, i) => <span key={i} className={"eta-leg eta-suit-" + i}>{n}</span>)}
        <span className="eta-rule">3 same suit +10 &middot; 5 same suit +20 &middot; pair +5 &middot; trip +12</span>
      </div>
    </div>
  );
}
