import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { YambDiceState, YambDiceAction, YambDiceSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function YambDiceGame({ state, dispatch, onGameOver }: GameProps<YambDiceState, YambDiceSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="ym-wrap"><div className="ym-done"><h2>Done!</h2><div className="ym-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="ym-wrap">
      <div className="ym-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="ym-score">{state.score} pts</div>
      {state.dice.length > 0 && <div className="ym-row">{state.dice.map((d, i) => <div key={i} className="ym-die">{d}</div>)}</div>}
      {state.message && <div className="ym-result">{state.message}</div>}
      {state.phase === "roll" && <button data-testid="hint-target-yamb-dice-roll" className="ym-btn" onClick={() => dispatch({ type:"roll" } as YambDiceAction)}>Roll</button>}
      {state.phase === "result" && <button data-testid="hint-target-yamb-dice-next" className="ym-btn alt" onClick={() => dispatch({ type:"next" } as YambDiceAction)}>Next</button>}
    </div>
  );
}
