import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RollAndWriteState, RollAndWriteAction, RollAndWriteSettings, Category } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, CATEGORIES, categoryScore } from "./state.js";
import "./Game.css";

const CAT_LABEL: Record<Category, string> = { small: "Small (1-3)", big: "Big (4-6)", evens: "Evens", odds: "Odds" };

export function RollAndWriteGame({ state, dispatch, onGameOver }: GameProps<RollAndWriteState, RollAndWriteSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dm-wrap"><div className="dm-done bounce-in"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dm-wrap">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score pulse">{state.score} pts</div>
      {state.dice.length > 0 && (
        <div className="dm-row">{state.dice.map((d, i) => <div key={i} className="dm-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button data-testid="hint-target-roll-and-write-roll" className="dm-btn" onClick={() => dispatch({ type:"roll" } as RollAndWriteAction)}>Roll 4</button>
      )}
      {state.phase === "choosing" && (
        <div className="dm-row">
          {CATEGORIES.map((cat, ci) => (
            <button key={cat} {...(ci === 0 ? { "data-testid": "hint-target-roll-and-write-choose" } : {})} className="dm-btn alt" disabled={state.used[cat]} onClick={() => dispatch({ type:"choose", cat } as RollAndWriteAction)}>
              {CAT_LABEL[cat]} ({categoryScore(state.dice, cat)})
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
