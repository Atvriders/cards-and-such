import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MiniMexicanState, MiniMexicanAction, MiniMexicanSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
export function MiniMexicanGame({ state, dispatch, onGameOver }: GameProps<MiniMexicanState, MiniMexicanSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  return (
    <div className="dm-wrap">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score">{state.score} pts</div>
      {state.dice && <div className="dm-row"><div className="dm-die">{state.dice[0]}</div><div className="dm-die">{state.dice[1]}</div></div>}
      {state.phase === "ready" && <button className="dm-btn" data-testid="hint-target-mini-mexican-roll" onClick={() => dispatch({ type:"roll" } as MiniMexicanAction)}>Roll!</button>}
      {state.phase === "rolled" && <>
        <div className="dm-result">{state.result}</div>
        <button className="dm-btn alt" data-testid="hint-target-mini-mexican-next" onClick={() => dispatch({ type:"next" } as MiniMexicanAction)}>Next</button>
      </>}
    </div>
  );
}
