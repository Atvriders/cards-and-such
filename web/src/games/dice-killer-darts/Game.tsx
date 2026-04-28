import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceKillerDartsState, DiceKillerDartsAction, DiceKillerDartsSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceKillerDartsGame({ state, dispatch, onGameOver }: GameProps<DiceKillerDartsState, DiceKillerDartsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="ds-killer-da-wrap"><div className="ds-killer-da-done"><h2>Done!</h2><div className="ds-killer-da-final">{state.score + state.lives * 20} pts ({state.lives} lives left)</div></div></div>;
  }
  return (
    <div className="ds-killer-da-wrap">
      <div className="ds-killer-da-info">Round {state.round} / {TOTAL_ROUNDS} — Lives: {state.lives}</div>
      <div className="ds-killer-da-score">{state.score} pts</div>
      {state.dice && (
        <div className="ds-killer-da-row">{state.dice.map((d, i) => <div key={i} className="ds-killer-da-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="ds-killer-da-btn" onClick={() => dispatch({ type:"roll" } as DiceKillerDartsAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="ds-killer-da-result">{state.hit ? "HIT! -1 life" : "+" + state.lastPts}</div>
          <button className="ds-killer-da-btn alt" onClick={() => dispatch({ type:"next" } as DiceKillerDartsAction)}>Next</button>
        </>
      )}
    </div>
  );
}
