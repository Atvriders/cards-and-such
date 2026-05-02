import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceSnakeLadderState, DiceSnakeLadderAction, DiceSnakeLadderSettings } from "./state.js";
import { isTerminal, TARGET } from "./state.js";
import "./Game.css";
export function DiceSnakeLadderGame({ state, dispatch, onGameOver }: GameProps<DiceSnakeLadderState, DiceSnakeLadderSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div>Rolls: {state.rolls}</div><div className="dm-final">{state.score} pts</div></div></div>;
  return (
    <div className="dm-wrap">
      <div className="dm-info">Position {state.pos} / {TARGET} — Rolls: {state.rolls}</div>
      <div className="dm-score">{state.score} pts (computed at end)</div>
      {state.lastRoll && <div className="dm-dice">Rolled {state.lastRoll}{state.lastEvent && ` — ${state.lastEvent}`}</div>}
      <button data-testid="hint-target-dice-snake-ladder-roll" className="dm-btn" onClick={() => dispatch({ type:"roll" } as DiceSnakeLadderAction)}>Roll</button>
    </div>
  );
}
