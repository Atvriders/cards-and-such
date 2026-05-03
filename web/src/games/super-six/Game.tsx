import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SuperSixState, SuperSixAction, SuperSixSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
export function SuperSixGame({ state, dispatch, onGameOver }: GameProps<SuperSixState, SuperSixSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dm-wrap">
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
        <button className="dm-btn" data-testid="hint-target-super-six-roll" onClick={() => dispatch({ type:"roll" } as SuperSixAction)}>Roll 3 Dice</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="dm-result">{state.busted ? "TRIPLE 1s — score wiped!" : state.lastBonus > 0 ? `+${state.lastBonus} pts` : "No sixes"}</div>
          <button className="dm-btn alt" data-testid="hint-target-super-six-next" onClick={() => dispatch({ type:"next" } as SuperSixAction)}>Next</button>
        </>
      )}
    </div>
  );
}
