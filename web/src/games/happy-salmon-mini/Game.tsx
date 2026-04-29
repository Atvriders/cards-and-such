import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HappySalmonMiniState, HappySalmonMiniAction } from "./state.js";
import { isTerminal, QUESTIONS } from "./state.js";
import "./Game.css";

export function HappySalmonMini({ state, dispatch, onGameOver }: GameProps<HappySalmonMiniState, { rounds: "10" }>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "gameover") return (
    <div className="g-wrap"><h2>Game Over</h2><p className="g-final">Score: {state.score} / 1000</p></div>
  );

  const qi = state.order[state.index];
  if (qi === undefined) return <div className="g-wrap">Loading…</div>;
  const q = QUESTIONS[qi]!;

  return (
    <div className="g-wrap">
      <div className="g-header">
        <span>Q {state.index + 1} / {QUESTIONS.length}</span>
        <span className="g-score">Score: {state.score}</span>
      </div>
      <div className="g-q">{q.q}</div>
      <div className="g-options">
        {q.a.map((opt, i) => {
          let cls = "g-opt";
          if (state.phase === "answered") {
            if (i === q.c) cls += " right";
            else if (i === state.selected) cls += " wrong";
          }
          return (
            <button key={i} className={cls} disabled={state.phase !== "ready"}
              onClick={() => dispatch({ type: "answer", choice: i } as HappySalmonMiniAction)}>
              {opt}
            </button>
          );
        })}
      </div>
      {state.phase === "answered" && (
        <button className="g-btn" onClick={() => dispatch({ type: "next" } as HappySalmonMiniAction)}>Next</button>
      )}
    </div>
  );
}
