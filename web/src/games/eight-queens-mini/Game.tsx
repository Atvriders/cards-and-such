import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { EightQueensMiniState, EightQueensMiniAction, EightQueensMiniSettings } from "./state.js";
import { isTerminal, SIZE, PUZZLE_COUNT } from "./state.js";
import "./Game.css";

export function EightQueensMiniGame({ state, dispatch, onGameOver }: GameProps<EightQueensMiniState, EightQueensMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="eq-wrap"><div className="eq-done"><h2>All Solved!</h2><div className="eq-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="eq-wrap">
      <div className="eq-info">Place {SIZE} non-attacking queens. Puzzle {state.puzzleIndex + 1} / {PUZZLE_COUNT}</div>
      <div className="eq-score">{state.score} pts</div>
      <div className="eq-board">
        {state.queens.map((q, i) => {
          const r = Math.floor(i / SIZE), c = i % SIZE;
          const dark = (r + c) % 2 === 1;
          return <button key={i} className={`eq-cell ${dark ? "dark" : ""} ${q ? "queen" : ""}`} onClick={() => dispatch({ type:"toggle", idx:i } as EightQueensMiniAction)}>{q ? "♕" : ""}</button>;
        })}
      </div>
      {state.message && <div className="eq-msg">{state.message}</div>}
      <div className="eq-row">
        <button className="eq-btn" onClick={() => dispatch({ type:"submit" } as EightQueensMiniAction)}>Submit</button>
        <button className="eq-btn alt" onClick={() => dispatch({ type:"reset" } as EightQueensMiniAction)}>Reset</button>
      </div>
    </div>
  );
}
