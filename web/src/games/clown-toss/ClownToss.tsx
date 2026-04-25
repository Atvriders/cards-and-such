import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ClownTossState, ClownTossSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./ClownToss.css";

export function ClownToss({ state, dispatch, onGameOver }: GameProps<ClownTossState, ClownTossSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  return (
    <div className="clown-toss">
      <div className="ct-stats">
        <span>Score: {state.score}</span>
        <span>Rings: {state.ringsLeft}/{state.totalRings}</span>
        <span>Streak: {state.consecutiveHits}</span>
      </div>

      <div className="ct-pegs">
        {state.pegs.map(peg => (
          <button
            key={peg.id}
            className="ct-peg"
            onClick={() => dispatch({ type: "toss", pegId: peg.id })}
            disabled={state.gameOver}
          >
            <span className="ct-peg-emoji">{peg.label}</span>
            <span className="ct-peg-pts">{peg.points}pts</span>
            <span className="ct-peg-rings">{"🔴".repeat(Math.min(peg.rings, 5))}</span>
          </button>
        ))}
      </div>

      <div className="ct-ring">
        {state.ringsLeft > 0 && !state.gameOver && "🔵".repeat(Math.min(state.ringsLeft, 7))}
      </div>

      {state.lastToss && <div className="ct-last">{state.lastToss}</div>}
      <div className="ct-message">{state.message}</div>

      <button onClick={() => dispatch({ type: "restart" })}>New Game</button>
    </div>
  );
}
