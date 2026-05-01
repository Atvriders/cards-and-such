import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceRelayState, DiceRelayAction, DiceRelaySettings } from "./state.js";
import { isTerminal, STAGE_TARGETS, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceRelayGame({ state, dispatch, onGameOver }: GameProps<DiceRelayState, DiceRelaySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="drly-wrap drly-theme"><div className="drly-done"><h2>Done!</h2><div className="drly-final">{state.score} pts</div></div></div>;
  }
  const target = STAGE_TARGETS[state.stage]!;
  return (
    <div className="drly-wrap drly-theme">
      <div className="drly-info">Round {state.round} / {TOTAL_ROUNDS} — Stage {state.stage + 1} / {STAGE_TARGETS.length} — Target sum ≥ {target}</div>
      <div className="drly-score">{state.score} pts</div>
      <div className="drly-stages">
        {STAGE_TARGETS.map((t, i) => <span key={i} className={`dr-pill ${i < state.stage ? "done" : i === state.stage ? "active" : ""}`}>{t}</span>)}
      </div>
      {state.lastRoll && (
        <div className="drly-row">
          <div className="drly-die">{state.lastRoll[0]}</div>
          <div className="drly-die">{state.lastRoll[1]}</div>
          <div className="drly-sum">= {state.lastRoll[0] + state.lastRoll[1]}</div>
        </div>
      )}
      {state.phase === "rolling" && <button className="drly-btn" onClick={() => dispatch({ type:"roll" } as DiceRelayAction)}>Roll</button>}
      {state.phase === "result" && (
        <>
          <div className="drly-result">{state.lastCleared ? "Cleared! +10" : "Failed — round ends"}</div>
          <button className="drly-btn alt" onClick={() => dispatch({ type:"next" } as DiceRelayAction)}>Continue</button>
        </>
      )}
    </div>
  );
}
