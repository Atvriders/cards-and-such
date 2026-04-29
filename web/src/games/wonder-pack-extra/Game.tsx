import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WonderPackExtraState, WonderPackExtraAction, WonderPackExtraSettings } from "./state.js";
import { isTerminal, score, TOTAL_ROUNDS, suitName, rankName } from "./state.js";
import "./Game.css";

export function WonderPackExtraGame({ state, dispatch, onGameOver }: GameProps<WonderPackExtraState, WonderPackExtraSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="dr-wrap">
      <h3 className="dr-title">7 Wonders: Wonder Pack</h3>
      <div className="dr-stats">
        <div>Round <b>{state.round}/{TOTAL_ROUNDS}</b></div>
        <div>You <b>{state.myScore}</b></div>
        <div>CPU <b>{state.cpuScore}</b></div>
      </div>
      {state.phase === "drafting" && (
        <>
          <div className="dr-prompt">Pick a card:</div>
          <div className="dr-offer">
            {state.offer.map((c, i) => (
              <button key={i} className="dr-card" onClick={() => dispatch({ type: "pick", idx: i } as WonderPackExtraAction)}>
                <div className="dr-rank">{rankName(c.rank)}</div>
                <div className="dr-suit">{suitName(c.suit)}</div>
              </button>
            ))}
          </div>
        </>
      )}
      {state.phase === "round-done" && (
        <div className="dr-event">
          <div>{state.lastEvent}</div>
          <button onClick={() => dispatch({ type: "next" } as WonderPackExtraAction)}>Next Round</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="dr-done">
          <h3>{state.myScore > state.cpuScore ? "Win! +25 bonus" : state.myScore === state.cpuScore ? "Tie" : "Lost"}</h3>
          <div>You: {state.myScore} | CPU: {state.cpuScore}</div>
          <div>Score: {score(state)}</div>
        </div>
      )}
      <div className="dr-tab">
        <div><b>Your tableau:</b> {state.myTableau.map(c => rankName(c.rank) + suitName(c.suit)[0]).join(" ")}</div>
        <div><b>CPU tableau:</b> {state.cpuTableau.map(c => rankName(c.rank) + suitName(c.suit)[0]).join(" ")}</div>
      </div>
    </div>
  );
}
