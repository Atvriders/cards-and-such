import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { JumboYahtzeeState, JumboYahtzeeAction, JumboYahtzeeSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function JumboYahtzeeGame({ state, dispatch, onGameOver }: GameProps<JumboYahtzeeState, JumboYahtzeeSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="jy-wrap"><div className="jy-done"><h2>Done!</h2><div className="jy-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="jy-wrap">
      <div className="jy-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="jy-score">{state.score} pts</div>
      {state.dice.length > 0 && <div className="jy-row">{state.dice.map((d, i) => <div key={i} className="jy-die">{d}</div>)}</div>}
      {state.message && <div className="jy-result">{state.message}</div>}
      {state.phase === "roll" && <button className="jy-btn" onClick={() => dispatch({ type:"roll" } as JumboYahtzeeAction)}>Roll</button>}
      {state.phase === "result" && <button className="jy-btn alt" onClick={() => dispatch({ type:"next" } as JumboYahtzeeAction)}>Next</button>}
    </div>
  );
}
