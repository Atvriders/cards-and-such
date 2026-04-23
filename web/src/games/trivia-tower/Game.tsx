import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TriviaTowerState, TriviaTowerAction, TriviaTowerSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const LABELS = ["A", "B", "C", "D"];

export function TriviaTower({ state, dispatch, onGameOver }: GameProps<TriviaTowerState, TriviaTowerSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="tower-wrap">
        <div className="tower-done">
          <h2>Tower Complete!</h2>
          <p>Final tower height: <strong>{state.blocks} blocks</strong></p>
          <p>Highest tower reached: <strong>{state.highBlock} blocks</strong></p>
          <p style={{ fontSize: "1.6rem", fontWeight: 900, color: "#27ae60" }}>Score: {state.blocks * 10 + state.highBlock}</p>
        </div>
      </div>
    );
  }

  const q = state.questions[state.currentIndex]!;
  const isResult = state.phase === "result";
  const lastWasCorrect = isResult && !state.wobble;

  const displayBlocks = Math.min(state.blocks, 10);

  return (
    <div className="tower-wrap">
      <div className="tower-header">
        <span className="tower-progress">Q {state.currentIndex + 1} / {state.questions.length}</span>
        <span className="tower-count">{state.blocks} blocks</span>
        <span className="tower-high">Best: {state.highBlock}</span>
      </div>

      <div className={`tower-visual${state.wobble ? " tower-wobble" : ""}`}>
        {Array.from({ length: displayBlocks }).map((_, i) => (
          <div key={i} className="tower-block" />
        ))}
        <div className="tower-ground" />
      </div>

      <div className="tower-question">{q.question}</div>

      <div className="tower-choices">
        {q.choices.map((choice, i) => {
          let cls = "tower-choice";
          if (isResult) {
            if (i === q.correct) cls += " correct";
            else if (i === state.selected && state.selected !== q.correct) cls += " wrong";
          } else if (i === state.selected) {
            cls += " selected";
          }
          return (
            <button
              key={i}
              className={cls}
              disabled={isResult}
              onClick={() => dispatch({ type: "select", choice: i } as TriviaTowerAction)}
            >
              <strong>{LABELS[i]}.</strong> {choice}
            </button>
          );
        })}
      </div>

      {isResult && (
        <div className={`tower-feedback ${lastWasCorrect ? "correct" : "wrong"}`}>
          {lastWasCorrect ? "+1 block added!" : state.blocks === 0 ? "Wrong! (tower at 0)" : "-1 block lost!"}
        </div>
      )}

      <div className="tower-actions">
        {!isResult && (
          <button
            className="tower-btn submit"
            disabled={state.selected === null}
            onClick={() => dispatch({ type: "submit" } as TriviaTowerAction)}
          >
            Submit
          </button>
        )}
        {isResult && (
          <button
            className="tower-btn next"
            onClick={() => dispatch({ type: "next" } as TriviaTowerAction)}
          >
            {state.currentIndex + 1 >= state.questions.length ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
