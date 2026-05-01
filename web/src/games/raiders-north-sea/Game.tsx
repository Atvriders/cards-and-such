import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RaidersNorthSeaState, RaidersNorthSeaAction, RaidersNorthSeaSettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, suitName, rankName, SUIT_NAMES } from "./state.js";
import "./Game.css";

export function RaidersNorthSeaGame({ state, dispatch, onGameOver }: GameProps<RaidersNorthSeaState, RaidersNorthSeaSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const finalScore = score(state);
  return (
    <div className="rns-wrap">
      <h3 className="rns-title">Raiders of the North Sea</h3>
      <div className="rns-stats">
        <div className="rns-stat"><span>Round</span><b>{state.round}/9</b></div>
        <div className="rns-stat"><span>You</span><b>{state.myScore}</b></div>
        <div className="rns-stat"><span>CPU</span><b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="rns-prompt">Pick one of 4 cards. CPU takes the highest remaining.</div>
          <div className="rns-offer">
            {state.offer.map((c, i) => (
              <button key={c.id + ":" + i} className={"rns-card rns-suit-" + c.suit} onClick={() => dispatch({ type: "pick", idx: i } as RaidersNorthSeaAction)}>
                <div className="rns-rank">{rankName(c.rank)}</div>
                <div className="rns-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="rns-event">
          <div className="rns-event-line">{state.lastEvent}</div>
          <button className="rns-next" onClick={() => dispatch({ type: "next" } as RaidersNorthSeaAction)}>Next Round &raquo;</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="rns-done">
          <h3>{state.myScore > state.cpuScore ? "Victory!" : state.myScore === state.cpuScore ? "Draw" : "Defeat"}</h3>
          <div className="rns-final">You: {state.myScore} &middot; CPU: {state.cpuScore}</div>
          <div className="rns-final-score">Final score: <b>{finalScore}</b></div>
        </div>
      )}
      <div className="rns-tableaus">
        <div className="rns-tab">
          <div className="rns-tab-label">Your tableau</div>
          <div className="rns-tab-row">
            {state.myTableau.map((c, i) => (
              <div key={i} className={"rns-mini rns-suit-" + c.suit}>
                <span className="rns-mini-rank">{rankName(c.rank)}</span>
                <span className="rns-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.myTableau.length === 0 && <div className="rns-empty">(none yet)</div>}
          </div>
        </div>
        <div className="rns-tab">
          <div className="rns-tab-label">CPU tableau</div>
          <div className="rns-tab-row">
            {state.cpuTableau.map((c, i) => (
              <div key={i} className={"rns-mini rns-suit-" + c.suit}>
                <span className="rns-mini-rank">{rankName(c.rank)}</span>
                <span className="rns-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.cpuTableau.length === 0 && <div className="rns-empty">(none yet)</div>}
          </div>
        </div>
      </div>
      <div className="rns-legend">
        Suits: {SUIT_NAMES.map((n, i) => <span key={i} className={"rns-leg rns-suit-" + i}>{n}</span>)}
        <span className="rns-rule">3 same suit +10 &middot; 5 same suit +20 &middot; pair +5 &middot; trip +12</span>
      </div>
    </div>
  );
}
