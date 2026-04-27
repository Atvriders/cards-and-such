import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceLeapState, DiceLeapAction, DiceLeapSettings } from "./state.js";
import { isTerminal, TARGET, MAX_ROLLS } from "./state.js";
import "./Game.css";

export function DiceLeapGame({ state, dispatch, onGameOver }: GameProps<DiceLeapState, DiceLeapSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dl-wrap"><div className="dl-done"><h2>{state.reached ? "You made it!" : "Out of rolls!"}</h2><div>Position: {state.position} / {TARGET}</div><div>Rolls used: {state.rollsUsed}</div><div className="dl-final">{state.score} pts</div></div></div>;
  }
  const pct = Math.min(100, (state.position / TARGET) * 100);
  return (
    <div className="dl-wrap">
      <div className="dl-info">Rolls: {state.rollsUsed} / {MAX_ROLLS}</div>
      <div className="dl-info">Position: {state.position} / {TARGET}</div>
      <div className="dl-track"><div className="dl-fill" style={{ width: `${pct}%` }} /></div>
      {state.lastRoll !== null && <div className="dl-die">{state.lastRoll}</div>}
      <button className="dl-btn" onClick={() => dispatch({ type: "roll" } as DiceLeapAction)}>Roll</button>
    </div>
  );
}
