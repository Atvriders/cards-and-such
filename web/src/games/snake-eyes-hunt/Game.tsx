import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SnakeEyesHuntState, SnakeEyesHuntAction, SnakeEyesHuntSettings } from "./state.js";
import { isTerminal, TOTAL_ROLLS } from "./state.js";
import "./Game.css";
export function SnakeEyesHuntGame({ state, dispatch, onGameOver }: GameProps<SnakeEyesHuntState, SnakeEyesHuntSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div>Snake eyes: {state.hits}</div><div className="dm-final">{state.score} pts</div></div></div>;
  return (
    <div className="dm-wrap">
      <div className="dm-info">Roll {state.roll} / {TOTAL_ROLLS}</div>
      <div className="dm-score">{state.score} pts (Hits: {state.hits})</div>
      {state.dice && <div className="dm-row"><div className="dm-die">{state.dice[0]}</div><div className="dm-die">{state.dice[1]}</div></div>}
      {state.phase === "rolling" && <button data-testid="hint-target-snake-eyes-hunt-roll" className="dm-btn" onClick={() => dispatch({ type:"roll" } as SnakeEyesHuntAction)}>Roll</button>}
      {state.phase === "result" && <>
        <div className="dm-result">{state.dice && state.dice[0] === 1 && state.dice[1] === 1 ? "SNAKE EYES! +50" : "no snake eyes"}</div>
        <button data-testid="hint-target-snake-eyes-hunt-next" className="dm-btn alt" onClick={() => dispatch({ type:"next" } as SnakeEyesHuntAction)}>{state.roll >= TOTAL_ROLLS ? "Finish" : "Next"}</button>
      </>}
    </div>
  );
}
