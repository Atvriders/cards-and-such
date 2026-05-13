import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceHotDiceState, DiceHotDiceAction, DiceHotDiceSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
const PIPS = ["⚀","⚁","⚂","⚃","⚄","⚅"];
export function DiceHotDiceGame({ state, dispatch, onGameOver }: GameProps<DiceHotDiceState, DiceHotDiceSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dhdc-wrap dhdc-theme"><div className="dhdc-done bounce-in"><h2>Done!</h2><div className="dhdc-final">{state.banked} pts banked</div></div></div>;
  }
  return (
    <div className="dhdc-wrap dhdc-theme fade-in">
      <div className="dhdc-header">Round {state.round}/{TOTAL_ROUNDS} <span className="dhdc-banked">Banked {state.banked}</span></div>
      <div className="dhdc-tally"><span>Current: {state.current}</span><span>Streak: {state.streak}</span></div>
      {state.lastDie && (
        <div className={`dhd-die${state.lastDie === 1 ? " bust" : ""}`}>{PIPS[state.lastDie - 1]}</div>
      )}
      {state.lastDie === 1 && state.current === 0 && <div className="dhdc-bust-msg">BUST! Round lost.</div>}
      <div className="dhdc-actions">
        <button data-testid="hint-target-dice-hot-dice-roll" className="dhdc-btn roll" onClick={() => dispatch({ type:"roll" } as DiceHotDiceAction)}>Roll</button>
        <button className="dhdc-btn bank" disabled={state.current === 0} onClick={() => dispatch({ type:"bank" } as DiceHotDiceAction)}>Bank ({state.current})</button>
      </div>
    </div>
  );
}
