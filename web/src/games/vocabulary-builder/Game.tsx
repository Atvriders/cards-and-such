import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { VocabularyBuilderState, VocabularyBuilderAction, VocabularyBuilderSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function VocabularyBuilderGame({ state, dispatch, onGameOver }: GameProps<VocabularyBuilderState, VocabularyBuilderSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as VocabularyBuilderAction), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") return <div className="vocabularybuilder-wrap"><div className="vocabularybuilder-done"><h2>Done!</h2><p>Correct: {state.correctCount} / {state.questions.length}</p><p style={{ fontSize: "1.8rem", fontWeight: 900, color: "#27ae60" }}>{state.score} pts</p></div></div>;
  const q = state.questions[state.currentIndex]!;
  const isResult = state.phase === "result";
  const urgent = state.timeLeft <= 5 && !state.submitted;
  return (
    <div className="vocabularybuilder-wrap">
      <div className="vocabularybuilder-header">
        <span className="vocabularybuilder-progress">Q {state.currentIndex + 1} / {state.questions.length}</span>
        <span className={`vocabularybuilder-timer${urgent ? " urgent" : ""}`}>{state.timeLeft}s</span>
        <span className="vocabularybuilder-score">{state.score} pts</span>
      </div>
      <div className="vocabularybuilder-question">{q.question}</div>
      <div className="vocabularybuilder-choices">
        {q.choices.map((choice, i) => {
          let cls = "vocabularybuilder-choice";
          if (isResult) {
            if (i === q.correct) cls += " correct";
            else if (i === state.selected && state.selected !== q.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button data-testid={`hint-target-vocabulary-builder-answer-${i}`} key={i} className={cls} disabled={isResult} onClick={() => dispatch({ type: "select", choice: i } as VocabularyBuilderAction)}><span className="vocabularybuilder-choice-letter">{LABELS[i]}</span>{choice}</button>;
        })}
      </div>
      {isResult && <div className={`vocabularybuilder-feedback ${state.selected === q.correct ? "correct" : "wrong"}`}>{state.selected === q.correct ? "Correct!" : `Wrong! Answer: ${q.choices[q.correct]}`}</div>}
      <div className="vocabularybuilder-actions">
        {!isResult && <button className="vocabularybuilder-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as VocabularyBuilderAction)}>Submit</button>}
        {isResult && <button className="vocabularybuilder-btn next" onClick={() => dispatch({ type: "next" } as VocabularyBuilderAction)}>{state.currentIndex + 1 >= state.questions.length ? "Finish" : "Next"}</button>}
      </div>
    </div>
  );
}
