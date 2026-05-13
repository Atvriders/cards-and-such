import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceMonopolyState, DiceMonopolyAction, DiceMonopolySettings } from "./state.js";
import { isTerminal, TOTAL_TURNS, BOARD } from "./state.js";
import "./Game.css";
export function DiceMonopolyGame({ state, dispatch, onGameOver }: GameProps<DiceMonopolyState, DiceMonopolySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="dm-wrap"><div className="dm-done bounce-in"><h2>Done!</h2><div className="dm-final">{Math.max(0, state.score)} pts</div></div></div>;
  return (
    <div className="dm-wrap fade-in">
      <div className="dm-info">Turn {state.turn} / {TOTAL_TURNS} — Pos: {state.pos + 1}/{BOARD.length}</div>
      <div className="dm-score pulse">{state.score} pts</div>
      {state.lastRoll && <div className="dm-dice">Rolled {state.lastRoll} → square {state.pos + 1} ({state.lastValue >= 0 ? "+" : ""}{state.lastValue})</div>}
      {state.phase === "rolling" && <button className="dm-btn" data-testid="hint-target-dice-monopoly-roll" onClick={() => dispatch({ type:"roll" } as DiceMonopolyAction)}>Roll</button>}
      {state.phase === "scored" && <button className="dm-btn alt" data-testid="hint-target-dice-monopoly-next" onClick={() => dispatch({ type:"next" } as DiceMonopolyAction)}>{state.turn >= TOTAL_TURNS ? "Finish" : "Next"}</button>}
    </div>
  );
}
