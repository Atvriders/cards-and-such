import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TripleThreeState, TripleThreeAction, TripleThreeSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
export function TripleThreeGame({ state, dispatch, onGameOver }: GameProps<TripleThreeState, TripleThreeSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dm-wrap triple-three-theme"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dm-wrap triple-three-theme">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score">{state.score} pts</div>
      {state.dice && (
        <div className="dm-row">
          <div className="dm-die">{state.dice[0]}</div>
          <div className="dm-die">{state.dice[1]}</div>
          <div className="dm-die">{state.dice[2]}</div>
        </div>
      )}
      {state.phase === "ready" && (
        <button className="dm-btn" data-testid="hint-target-triple-three-roll" onClick={() => dispatch({ type:"roll" } as TripleThreeAction)}>Roll 3 Dice</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="dm-result">{state.lastBonus === 50 ? "TRIPLE THREES! +50" : state.lastBonus === 15 ? "High roll! +15" : "+5"}</div>
          <button className="dm-btn alt" data-testid="hint-target-triple-three-next" onClick={() => dispatch({ type:"next" } as TripleThreeAction)}>Next</button>
        </>
      )}
    </div>
  );
}
