import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LuckySixState, LuckySixAction, LuckySixSettings } from "./state.js";
import { isTerminal, TOTAL_ROLLS } from "./state.js";
import "./Game.css";
export function LuckySixGame({ state, dispatch, onGameOver }: GameProps<LuckySixState, LuckySixSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="dm-wrap lucky-six-theme"><div className="dm-done"><h2>Done!</h2><div>Sixes: {state.sixes}</div><div className="dm-final">{state.score} pts</div></div></div>;
  return (
    <div className="dm-wrap lucky-six-theme">
      <div className="dm-info">Roll {state.roll} / {TOTAL_ROLLS}</div>
      <div className="dm-score">{state.score} pts (Sixes: {state.sixes})</div>
      {state.lastDie !== null && <div className="dm-die">{state.lastDie}</div>}
      {state.phase === "rolling" && <button className="dm-btn" data-testid="hint-target-lucky-six-roll" onClick={() => dispatch({ type:"roll" } as LuckySixAction)}>Roll</button>}
      {state.phase === "result" && <>
        <div className="dm-result">{state.lastDie === 6 ? "SIX! +20" : "no six"}</div>
        <button className="dm-btn alt" data-testid="hint-target-lucky-six-next" onClick={() => dispatch({ type:"next" } as LuckySixAction)}>{state.roll >= TOTAL_ROLLS ? "Finish" : "Next"}</button>
      </>}
    </div>
  );
}
