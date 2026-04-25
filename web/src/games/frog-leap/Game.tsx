import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FrogLeapState, FrogLeapAction, FrogLeapSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function FrogLeap({ state, dispatch, onGameOver }: GameProps<FrogLeapState, FrogLeapSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "gameover") {
    return <div className="frog-wrap"><h2>Frog Rests!</h2><p style={{ fontSize: "1.8rem", fontWeight: 900, color: "#27ae60" }}>{state.score} pts</p></div>;
  }

  return (
    <div className="frog-wrap">
      <div className="frog-header"><span>Jumps left: {state.jumpsLeft}</span><span>Score: {state.score}</span></div>
      <div className="frog-pond">
        {/* Frog */}
        <div className="frog-icon" style={{ left: `${state.frog.x}%`, top: `${state.frog.y}%` }}>🐸</div>
        {/* Lily pads */}
        {state.pads.map(pad => {
          const isCurrent = pad.id === state.currentPad;
          return (
            <button key={pad.id} className={`lily-pad${isCurrent ? " current" : ""}`}
              style={{ left: `${pad.x}%`, top: `${pad.y}%` }}
              disabled={isCurrent}
              onClick={() => dispatch({ type: "jump", padId: pad.id } as FrogLeapAction)}>
              🪷
            </button>
          );
        })}
      </div>
      <p style={{ color: "#555", fontSize: "0.9rem" }}>Click a lily pad to jump! Farther jumps score more.</p>
    </div>
  );
}
