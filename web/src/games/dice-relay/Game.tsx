import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceRelayState, DiceRelayAction, DiceRelaySettings } from "./state.js";
import { isTerminal, STAGE_TARGETS, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceRelayGame({ state, dispatch, onGameOver }: GameProps<DiceRelayState, DiceRelaySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dr-wrap"><div className="dr-done"><h2>Done!</h2><div className="dr-final">{state.score} pts</div></div></div>;
  }
  const target = STAGE_TARGETS[state.stage]!;
  return (
    <div className="dr-wrap">
      <div className="dr-info">Round {state.round} / {TOTAL_ROUNDS} — Stage {state.stage + 1} / {STAGE_TARGETS.length} — Target sum ≥ {target}</div>
      <div className="dr-score">{state.score} pts</div>
      <div className="dr-stages">
        {STAGE_TARGETS.map((t, i) => <span key={i} className={`dr-pill ${i < state.stage ? "done" : i === state.stage ? "active" : ""}`}>{t}</span>)}
      </div>
      {state.lastRoll && (
        <div className="dr-row">
          <div className="dr-die">{state.lastRoll[0]}</div>
          <div className="dr-die">{state.lastRoll[1]}</div>
          <div className="dr-sum">= {state.lastRoll[0] + state.lastRoll[1]}</div>
        </div>
      )}
      {state.phase === "rolling" && <button className="dr-btn" onClick={() => dispatch({ type:"roll" } as DiceRelayAction)}>Roll</button>}
      {state.phase === "result" && (
        <>
          <div className="dr-result">{state.lastCleared ? "Cleared! +10" : "Failed — round ends"}</div>
          <button className="dr-btn alt" onClick={() => dispatch({ type:"next" } as DiceRelayAction)}>Continue</button>
        </>
      )}
    </div>
  );
}
