import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SushiGoPartyMenuState, SushiGoPartyMenuAction, SushiGoPartyMenuSettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, OFFER_SIZE, suitName, rankName, SUIT_NAMES } from "./state.js";
import "./Game.css";

export function SushiGoPartyMenuGame({ state, dispatch, onGameOver }: GameProps<SushiGoPartyMenuState, SushiGoPartyMenuSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const finalScore = score(state);
  return (
    <div className="sgpm-wrap">
      <h3 className="sgpm-title">Sushi Go Party Menu</h3>
      <div className="sgpm-stats">
        <div className="sgpm-stat"><span>Round</span><b>{state.round}/10</b></div>
        <div className="sgpm-stat"><span>You</span><b>{state.myScore}</b></div>
        <div className="sgpm-stat"><span>CPU</span><b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="sgpm-prompt">Pick one of 4 cards. CPU takes the highest remaining.</div>
          <div className="sgpm-offer">
            {state.offer.map((c, i) => (
              <button key={c.id + ":" + i} className={"sgpm-card sgpm-suit-" + c.suit} onClick={() => dispatch({ type: "pick", idx: i } as SushiGoPartyMenuAction)}>
                <div className="sgpm-rank">{rankName(c.rank)}</div>
                <div className="sgpm-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="sgpm-event">
          <div className="sgpm-event-line">{state.lastEvent}</div>
          <button className="sgpm-next" onClick={() => dispatch({ type: "next" } as SushiGoPartyMenuAction)}>Next Round &raquo;</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="sgpm-done">
          <h3>{state.myScore > state.cpuScore ? "Victory!" : state.myScore === state.cpuScore ? "Draw" : "Defeat"}</h3>
          <div className="sgpm-final">You: {state.myScore} &middot; CPU: {state.cpuScore}</div>
          <div className="sgpm-final-score">Final score: <b>{finalScore}</b></div>
        </div>
      )}
      <div className="sgpm-tableaus">
        <div className="sgpm-tab">
          <div className="sgpm-tab-label">Your tableau</div>
          <div className="sgpm-tab-row">
            {state.myTableau.map((c, i) => (
              <div key={i} className={"sgpm-mini sgpm-suit-" + c.suit}>
                <span className="sgpm-mini-rank">{rankName(c.rank)}</span>
                <span className="sgpm-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.myTableau.length === 0 && <div className="sgpm-empty">(none yet)</div>}
          </div>
        </div>
        <div className="sgpm-tab">
          <div className="sgpm-tab-label">CPU tableau</div>
          <div className="sgpm-tab-row">
            {state.cpuTableau.map((c, i) => (
              <div key={i} className={"sgpm-mini sgpm-suit-" + c.suit}>
                <span className="sgpm-mini-rank">{rankName(c.rank)}</span>
                <span className="sgpm-mini-suit">{suitName(c.suit).slice(0,3)}</span>
              </div>
            ))}
            {state.cpuTableau.length === 0 && <div className="sgpm-empty">(none yet)</div>}
          </div>
        </div>
      </div>
      <div className="sgpm-legend">
        Suits: {SUIT_NAMES.map((n, i) => <span key={i} className={"sgpm-leg sgpm-suit-" + i}>{n}</span>)}
        <span className="sgpm-rule">3 same suit +10 &middot; 5 same suit +20 &middot; pair +5 &middot; trip +12</span>
      </div>
    </div>
  );
}
