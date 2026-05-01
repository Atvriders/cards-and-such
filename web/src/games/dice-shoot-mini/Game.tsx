import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceShootMiniState, DiceShootMiniAction, DiceShootMiniSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
const PIPS = ["⚀","⚁","⚂","⚃","⚄","⚅"];
export function DiceShootMiniGame({ state, dispatch, onGameOver }: GameProps<DiceShootMiniState, DiceShootMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dshm-wrap dshm-theme"><div className="dshm-done"><h2>Done!</h2><div>Hits: {state.hits}/{TOTAL_ROUNDS}</div><div className="dshm-final">{t?.score} pts</div></div></div>;
  }
  return (
    <div className="dshm-wrap dshm-theme">
      <div className="dshm-header">Round {state.round}/{TOTAL_ROUNDS} <span className="dshm-score">{state.score}</span></div>
      <div className="dshm-target">Target: <span className="dshm-target-val">{PIPS[state.target - 1]}</span></div>
      {state.die && (
        <div className={`dsm-result ${state.die === state.target ? "hit" : "miss"}`}>
          You rolled {PIPS[state.die - 1]} — {state.die === state.target ? "HIT! +25" : Math.abs(state.die - state.target) === 1 ? "Close! +5" : "Miss"}
        </div>
      )}
      {state.phase === "aim" ? (
        <button className="dshm-btn shoot" onClick={() => dispatch({ type:"shoot" } as DiceShootMiniAction)}>SHOOT!</button>
      ) : (
        <button className="dshm-btn next" onClick={() => dispatch({ type:"next" } as DiceShootMiniAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next Target"}</button>
      )}
    </div>
  );
}
