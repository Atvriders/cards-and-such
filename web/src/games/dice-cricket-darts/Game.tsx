import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceCricketDartsState, DiceCricketDartsAction, DiceCricketDartsSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

const NAMES = ["15","16","17","18","19","20"];

export function DiceCricketDartsGame({ state, dispatch, onGameOver }: GameProps<DiceCricketDartsState, DiceCricketDartsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="ds-cricket-d-wrap"><div className="ds-cricket-d-done"><h2>Done!</h2><div className="ds-cricket-d-final">{state.score + state.marks.filter(m=>m>=3).length*5} pts</div></div></div>;
  }
  return (
    <div className="ds-cricket-d-wrap">
      <div className="ds-cricket-d-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="ds-cricket-d-score">{state.score} pts</div>
      <div className="ds-cricket-d-row">{state.marks.map((m,i)=> <div key={i} className="ds-cricket-d-die" style={{opacity:m>=3?1:0.5}}>{NAMES[i]}: {m}/3</div>)}</div>
      {state.dice && (
        <div className="ds-cricket-d-row">{state.dice.map((d, i) => <div key={i} className="ds-cricket-d-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="ds-cricket-d-btn" onClick={() => dispatch({ type:"roll" } as DiceCricketDartsAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="ds-cricket-d-result">+{state.lastPts}</div>
          <button className="ds-cricket-d-btn alt" onClick={() => dispatch({ type:"next" } as DiceCricketDartsAction)}>Next</button>
        </>
      )}
    </div>
  );
}
