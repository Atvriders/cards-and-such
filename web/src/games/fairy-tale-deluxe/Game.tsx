import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FairyTaleDeluxeState, FairyTaleDeluxeAction, FairyTaleDeluxeSettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, suitName, rankName, SUIT_NAMES } from "./state.js";
import "./Game.css";

export function FairyTaleDeluxeGame({ state, dispatch, onGameOver }: GameProps<FairyTaleDeluxeState, FairyTaleDeluxeSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const finalScore = score(state);
  return (
    <div className="ftdx-wrap">
      <h3 className="ftdx-title">Fairy Tale Deluxe</h3>
      <div className="ftdx-stats">
        <div className="ftdx-stat"><span>Round</span><b>{state.round}/9</b></div>
        <div className="ftdx-stat"><span>You</span><b>{state.myScore}</b></div>
        <div className="ftdx-stat"><span>CPU</span><b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="ftdx-prompt">Pick one of 4 cards. CPU takes the highest remaining.</div>
          <div className="ftdx-offer">
            {state.offer.map((c, i) => (
              <button key={c.id + ":" + i} className={"ftdx-card ftdx-suit-" + c.suit} onClick={() => dispatch({ type: "pick", idx: i } as FairyTaleDeluxeAction)}>
                <div className="ftdx-rank">{rankName(c.rank)}</div>
                <div className="ftdx-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="ftdx-event">
          <div className="ftdx-event-line">{state.lastEvent}</div>
          <button className="ftdx-next" onClick={() => dispatch({ type: "next" } as FairyTaleDeluxeAction)}>Next Round &raquo;</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="ftdx-done">
          <h3>{state.myScore > state.cpuScore ? "Victory!" : state.myScore === state.cpuScore ? "Draw" : "Defeat"}</h3>
          <div className="ftdx-final">You: {state.myScore} &middot; CPU: {state.cpuScore}</div>
          <div className="ftdx-final-score">Final score: <b>{finalScore}</b></div>
        </div>
      )}
      <div className="ftdx-tableaus">
        <div className="ftdx-tab">
          <div className="ftdx-tab-label">Your tableau</div>
          <div className="ftdx-tab-row">
            {state.myTableau.map((c, i) => (
              <div key={i} className={"ftdx-mini ftdx-suit-" + c.suit}>
                <span className="ftdx-mini-rank">{rankName(c.rank)}</span>
                <span className="ftdx-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.myTableau.length === 0 && <div className="ftdx-empty">(none yet)</div>}
          </div>
        </div>
        <div className="ftdx-tab">
          <div className="ftdx-tab-label">CPU tableau</div>
          <div className="ftdx-tab-row">
            {state.cpuTableau.map((c, i) => (
              <div key={i} className={"ftdx-mini ftdx-suit-" + c.suit}>
                <span className="ftdx-mini-rank">{rankName(c.rank)}</span>
                <span className="ftdx-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.cpuTableau.length === 0 && <div className="ftdx-empty">(none yet)</div>}
          </div>
        </div>
      </div>
      <div className="ftdx-legend">
        Suits: {SUIT_NAMES.map((n, i) => <span key={i} className={"ftdx-leg ftdx-suit-" + i}>{n}</span>)}
        <span className="ftdx-rule">3 same suit +10 &middot; 5 same suit +20 &middot; pair +5 &middot; trip +12</span>
      </div>
    </div>
  );
}
