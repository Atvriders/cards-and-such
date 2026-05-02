import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceCheckersState, DiceCheckersAction, DiceCheckersSettings } from "./state.js";
import { isTerminal, TOTAL_TURNS } from "./state.js";
import "./Game.css";
export function DiceCheckersGame({ state, dispatch, onGameOver }: GameProps<DiceCheckersState, DiceCheckersSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div>Captures: {state.captures}</div><div className="dm-final">{state.score} pts</div></div></div>;
  return (
    <div className="dm-wrap">
      <div className="dm-info">Turn {state.turn} / {TOTAL_TURNS} — Captures: {state.captures}</div>
      <div className="dm-score">{state.score} pts</div>
      {state.lastRoll && <div className="dm-dice">Rolled {state.lastRoll} — {state.lastCapture ? "Capture!" : "Move only"}</div>}
      {state.phase === "rolling" && <button className="dm-btn" data-testid="hint-target-dice-checkers-roll" onClick={() => dispatch({ type:"roll" } as DiceCheckersAction)}>Roll</button>}
      {state.phase === "scored" && <button className="dm-btn alt" data-testid="hint-target-dice-checkers-next" onClick={() => dispatch({ type:"next" } as DiceCheckersAction)}>{state.turn >= TOTAL_TURNS ? "Finish" : "Next"}</button>}
    </div>
  );
}
