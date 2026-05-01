import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DuelPantheonGodsState, DuelPantheonGodsAction, DuelPantheonGodsSettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, suitName, rankName, SUIT_NAMES } from "./state.js";
import "./Game.css";

export function DuelPantheonGodsGame({ state, dispatch, onGameOver }: GameProps<DuelPantheonGodsState, DuelPantheonGodsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const finalScore = score(state);
  return (
    <div className="dpg-wrap">
      <h3 className="dpg-title">7 Wonders Duel: Pantheon</h3>
      <div className="dpg-stats">
        <div className="dpg-stat"><span>Round</span><b>{state.round}/8</b></div>
        <div className="dpg-stat"><span>You</span><b>{state.myScore}</b></div>
        <div className="dpg-stat"><span>CPU</span><b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="dpg-prompt">Pick one of 4 cards. CPU takes the highest remaining.</div>
          <div className="dpg-offer">
            {state.offer.map((c, i) => (
              <button key={c.id + ":" + i} className={"dpg-card dpg-suit-" + c.suit} onClick={() => dispatch({ type: "pick", idx: i } as DuelPantheonGodsAction)}>
                <div className="dpg-rank">{rankName(c.rank)}</div>
                <div className="dpg-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="dpg-event">
          <div className="dpg-event-line">{state.lastEvent}</div>
          <button className="dpg-next" onClick={() => dispatch({ type: "next" } as DuelPantheonGodsAction)}>Next Round &raquo;</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="dpg-done">
          <h3>{state.myScore > state.cpuScore ? "Victory!" : state.myScore === state.cpuScore ? "Draw" : "Defeat"}</h3>
          <div className="dpg-final">You: {state.myScore} &middot; CPU: {state.cpuScore}</div>
          <div className="dpg-final-score">Final score: <b>{finalScore}</b></div>
        </div>
      )}
      <div className="dpg-tableaus">
        <div className="dpg-tab">
          <div className="dpg-tab-label">Your tableau</div>
          <div className="dpg-tab-row">
            {state.myTableau.map((c, i) => (
              <div key={i} className={"dpg-mini dpg-suit-" + c.suit}>
                <span className="dpg-mini-rank">{rankName(c.rank)}</span>
                <span className="dpg-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.myTableau.length === 0 && <div className="dpg-empty">(none yet)</div>}
          </div>
        </div>
        <div className="dpg-tab">
          <div className="dpg-tab-label">CPU tableau</div>
          <div className="dpg-tab-row">
            {state.cpuTableau.map((c, i) => (
              <div key={i} className={"dpg-mini dpg-suit-" + c.suit}>
                <span className="dpg-mini-rank">{rankName(c.rank)}</span>
                <span className="dpg-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.cpuTableau.length === 0 && <div className="dpg-empty">(none yet)</div>}
          </div>
        </div>
      </div>
      <div className="dpg-legend">
        Suits: {SUIT_NAMES.map((n, i) => <span key={i} className={"dpg-leg dpg-suit-" + i}>{n}</span>)}
        <span className="dpg-rule">3 same suit +10 &middot; 5 same suit +20 &middot; pair +5 &middot; trip +12</span>
      </div>
    </div>
  );
}
