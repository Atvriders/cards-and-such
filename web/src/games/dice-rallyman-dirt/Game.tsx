import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceRallymanDirtState, DiceRallymanDirtAction, DiceRallymanDirtSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceRallymanDirtGame({ state, dispatch, onGameOver }: GameProps<DiceRallymanDirtState, DiceRallymanDirtSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="g-diceralldirt-wrap"><div className="g-diceralldirt-done"><h2>Match!</h2><div className="g-diceralldirt-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="g-diceralldirt-wrap">
      <div className="g-diceralldirt-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="g-diceralldirt-score">{state.score} pts</div>
      {state.dice && (
        <div className="g-diceralldirt-row">{state.dice.map((d, i) => <div key={i} className="g-diceralldirt-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="g-diceralldirt-btn" onClick={() => dispatch({ type:"roll" } as DiceRallymanDirtAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="g-diceralldirt-result">+{state.lastPts}</div>
          <button className="g-diceralldirt-btn alt" onClick={() => dispatch({ type:"next" } as DiceRallymanDirtAction)}>Next</button>
        </>
      )}
    </div>
  );
}
