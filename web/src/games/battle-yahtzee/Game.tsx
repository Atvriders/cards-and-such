import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BattleYahtzeeState, BattleYahtzeeAction, BattleYahtzeeSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function BattleYahtzeeGame({ state, dispatch, onGameOver }: GameProps<BattleYahtzeeState, BattleYahtzeeSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="by-wrap"><div className="by-done"><h2>Done!</h2><div className="by-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="by-wrap">
      <div className="by-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="by-score">{state.score} pts</div>
      {state.dice.length > 0 && <div className="by-row">{state.dice.map((d, i) => <div key={i} className="by-die">{d}</div>)}</div>}
      {state.message && <div className="by-result">{state.message}</div>}
      {state.phase === "roll" && <button className="by-btn" onClick={() => dispatch({ type:"roll" } as BattleYahtzeeAction)}>Roll</button>}
      {state.phase === "result" && <button className="by-btn alt" onClick={() => dispatch({ type:"next" } as BattleYahtzeeAction)}>Next</button>}
    </div>
  );
}
