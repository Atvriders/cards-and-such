import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceClutchRollState, DiceClutchRollAction, DiceClutchRollSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function DiceClutchRollGame({ state, dispatch, onGameOver }: GameProps<DiceClutchRollState, DiceClutchRollSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  if (state.phase === "gameover") return <div className="dm-wrap"><div className="dm-done bounce-in"><h2>Done!</h2><p>Total: {state.score} pts</p></div></div>;
  return (
    <div className="dm-wrap fade-in">
      <div className="dm-header"><span>Round {state.round}/{state.maxRounds}</span><span className="dm-score pulse">{state.score} pts</span></div>
      <p>Roll 4 dice — keep the top 3!</p>
      {state.phase === "waiting" && <button className="dm-btn" data-testid="hint-target-dice-clutch-roll-roll" onClick={() => dispatch({ type:"roll" } as DiceClutchRollAction)}>Roll!</button>}
      {state.phase === "result" && state.allDice.length > 0 && <>
        <div className="dm-dice">{state.allDice.map((d,i) => <div key={i} className={`dm-die ${state.keptDice.includes(d)?"":"dm-die-dropped"}`} style={!state.keptDice.includes(d)?{opacity:0.4}:{}}>{d}</div>)}</div>
        <div className="dm-result">Kept: {state.keptDice.join(", ")} → +{state.lastPts} pts</div>
        <button className="dm-btn" data-testid="hint-target-dice-clutch-roll-next" onClick={() => dispatch({ type:"next" } as DiceClutchRollAction)}>{state.round >= state.maxRounds ? "Finish" : "Next"}</button>
      </>}
    </div>
  );
}
