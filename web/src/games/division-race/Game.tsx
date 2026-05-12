import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DivisionRaceState, DivisionRaceAction, DivisionRaceSettings } from "./state.js";
import { isTerminal, TOTAL_QUESTIONS } from "./state.js";
import "./Game.css";

export function DivisionRaceGame({ state, dispatch, onGameOver }: GameProps<DivisionRaceState, DivisionRaceSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as DivisionRaceAction), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="mr-wrap"><div className="mr-done bounce-in"><h2>Time!</h2><div>Correct: {state.correctCount} / {TOTAL_QUESTIONS}</div><div className="mr-final">{state.score} pts</div></div></div>;
  }
  const q = state.questions[state.currentIndex]!;
  return (
    <div className="mr-wrap fade-in">
      <div className="mr-info">Q {state.currentIndex + 1} / {TOTAL_QUESTIONS}</div>
      <div className="mr-timer">{state.timeLeft}s</div>
      <div className="mr-score pulse">{state.score} pts</div>
      <div className="mr-question">{q.a} ÷ {q.b} = ?</div>
      <div className="mr-choices">
        {q.choices.map((c, i) => (
          <button key={i} className="mr-choice" onClick={() => dispatch({ type: "answer", choice: i } as DivisionRaceAction)}>{c}</button>
        ))}
      </div>
    </div>
  );
}
