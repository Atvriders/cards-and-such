import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ClimbTheLadderState, ClimbTheLadderAction, ClimbTheLadderSettings } from "./state.js";
import { isTerminal, RUNGS } from "./state.js";
import "./Game.css";

export function ClimbTheLadderDice({ state, dispatch, onGameOver }: GameProps<ClimbTheLadderState, ClimbTheLadderSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "gameover") {
    return (
      <div className="dice-wrap">
        <h2>Ladder Complete!</h2>
        <p style={{ fontSize: "1.8rem", fontWeight: 900, color: "#27ae60" }}>{state.score} pts</p>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
          {RUNGS.map((t, i) => <span key={i} style={{ padding: "4px 10px", borderRadius: "6px", background: (state.rungScores[i] ?? 0) > 0 ? "#eafaf1" : "#fdedec", color: "#333", border: "1px solid #ccc" }}>Rung {i + 1}(≥{t}): {state.rungScores[i] ?? 0}</span>)}
        </div>
      </div>
    );
  }

  const target = RUNGS[state.rung]!;
  const sum = state.dice[0] + state.dice[1];

  return (
    <div className="dice-wrap">
      <div className="dice-header"><span>Rung {state.rung + 1}/6 — Target: ≥{target}</span><span>Score: {state.score}</span></div>
      <div className="dice-row">
        {state.dice.map((d, i) => (
          <button key={i} className={`die${state.held[i] ? " die-double" : ""}`}
            style={{ cursor: state.rerollsLeft > 0 ? "pointer" : "default" }}
            onClick={() => dispatch({ type: "toggleHold", idx: i as 0 | 1 } as ClimbTheLadderAction)}>{d}</button>
        ))}
      </div>
      <p className="dice-msg">Sum: {sum} {sum >= target ? "✓ Pass!" : "✗ Miss"}</p>
      <div className="dice-actions">
        {state.rerollsLeft > 0 && <button className="dice-btn" onClick={() => dispatch({ type: "roll" } as ClimbTheLadderAction)}>Re-roll ({state.rerollsLeft} left)</button>}
        <button className="dice-btn bank" onClick={() => dispatch({ type: "accept" } as ClimbTheLadderAction)}>Accept {sum >= target ? `+${sum} pts` : "+0 pts"}</button>
      </div>
      <p style={{ color: "#888", fontSize: "0.85rem" }}>Click a die to hold it before re-rolling</p>
    </div>
  );
}
