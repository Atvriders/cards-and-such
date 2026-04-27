import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MiniYahtzeeState, MiniYahtzeeAction, MiniYahtzeeSettings } from "./state.js";
import { isTerminal, CATEGORIES, scoreCategory } from "./state.js";
import "./Game.css";
export function MiniYahtzeeGame({ state, dispatch, onGameOver }: GameProps<MiniYahtzeeState, MiniYahtzeeSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  return (
    <div className="dm-wrap">
      <div className="dm-info">Rolls left: {state.rollsLeft}</div>
      <div className="dm-score">{state.score} pts</div>
      <div className="dm-row">{state.dice.map((d, i) => <button key={i} disabled={state.rollsLeft === 3} className="dm-die" style={{ background: state.held[i] ? "#27ae60" : "#fff", color: state.held[i] ? "#fff" : "#2c3e50" }} onClick={() => dispatch({ type:"toggle", idx:i } as MiniYahtzeeAction)}>{d}</button>)}</div>
      {state.rollsLeft > 0 && <button className="dm-btn" onClick={() => dispatch({ type:"roll" } as MiniYahtzeeAction)}>Roll</button>}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:6, width:"100%" }}>
        {CATEGORIES.map((label, i) => {
          const filled = state.scoreboard[i] !== null;
          const wouldScore = filled ? state.scoreboard[i] : (state.rollsLeft < 3 ? scoreCategory(i, state.dice) : 0);
          return <button key={i} className="dm-cell" disabled={filled || state.rollsLeft === 3} onClick={() => dispatch({ type:"place", cat:i } as MiniYahtzeeAction)}>{label}: {filled ? state.scoreboard[i] : (state.rollsLeft < 3 ? `(${wouldScore})` : "—")}</button>;
        })}
      </div>
    </div>
  );
}
