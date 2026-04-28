import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceSpikeballState, DiceSpikeballAction, DiceSpikeballSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceSpikeballGame({ state, dispatch, onGameOver }: GameProps<DiceSpikeballState, DiceSpikeballSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="ds-spikeball-wrap"><div className="ds-spikeball-done"><h2>Done!</h2><div className="ds-spikeball-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="ds-spikeball-wrap">
      <div className="ds-spikeball-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="ds-spikeball-score">{state.score} pts</div>
      {state.dice && (
        <div className="ds-spikeball-row">{state.dice.map((d, i) => <div key={i} className="ds-spikeball-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="ds-spikeball-btn" onClick={() => dispatch({ type:"roll" } as DiceSpikeballAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="ds-spikeball-result">+{state.lastPts}</div>
          <button className="ds-spikeball-btn alt" onClick={() => dispatch({ type:"next" } as DiceSpikeballAction)}>Next</button>
        </>
      )}
    </div>
  );
}
