import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceSpellState, DiceSpellAction, DiceSpellSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceSpellGame({ state, dispatch, onGameOver }: GameProps<DiceSpellState, DiceSpellSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dm-wrap">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score">{state.score} pts</div>
      <div className="dm-word">{state.word}</div>
      {state.dice.length > 0 && (
        <div className="dm-row">
          {state.dice.map((d, i) => <div key={i} className="dm-die">{d}</div>)}
        </div>
      )}
      {state.phase === "rolling" && (
        <button className="dm-btn" onClick={() => dispatch({ type:"roll" } as DiceSpellAction)}>Roll 5</button>
      )}
      {state.phase === "scored" && (
        <>
          <div className="dm-result">{state.matches} match{state.matches === 1 ? "" : "es"} → +{state.pts}</div>
          <button className="dm-btn alt" onClick={() => dispatch({ type:"next" } as DiceSpellAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
      <div className="dm-info">Groups: 1=A-E, 2=F-J, 3=K-O, 4=P-T, 5=U-Y, 6=Wild</div>
    </div>
  );
}
