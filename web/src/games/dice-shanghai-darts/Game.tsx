import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceShanghaiDartsState, DiceShanghaiDartsAction, DiceShanghaiDartsSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceShanghaiDartsGame({ state, dispatch, onGameOver }: GameProps<DiceShanghaiDartsState, DiceShanghaiDartsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="ds-shanghai--wrap"><div className="ds-shanghai--done"><h2>Done!</h2><div className="ds-shanghai--final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="ds-shanghai--wrap">
      <div className="ds-shanghai--info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="ds-shanghai--score">{state.score} pts</div>
      {state.dice && (
        <div className="ds-shanghai--row">{state.dice.map((d, i) => <div key={i} className="ds-shanghai--die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="ds-shanghai--btn" onClick={() => dispatch({ type:"roll" } as DiceShanghaiDartsAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="ds-shanghai--result">+{state.lastPts}</div>
          <button className="ds-shanghai--btn alt" onClick={() => dispatch({ type:"next" } as DiceShanghaiDartsAction)}>Next</button>
        </>
      )}
    </div>
  );
}
