import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { JeopardyState, JeopardyAction, JeopardySettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function JeopardyLike({ state, dispatch, onGameOver }: GameProps<JeopardyState, JeopardySettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="jeo-wrap">
        <div className="jeo-done">
          <h2>Final Score</h2>
          <div className="jeo-done-score">${state.score.toLocaleString()}</div>
        </div>
      </div>
    );
  }

  if (state.phase === "final_wager" || state.phase === "final_answer" || state.phase === "final_reveal") {
    return (
      <div className="jeo-wrap">
        <div className="jeo-header">
          <span className="jeo-title">Final Round</span>
          <span className="jeo-score">${state.score.toLocaleString()}</span>
        </div>
        <div className="jeo-final-card">
          <div className="jeo-final-title">Final Jeopardy</div>
          <div className="jeo-final-question">{state.finalClue.question}</div>
        </div>

        {state.phase === "final_wager" && (
          <div className="jeo-answer-row">
            <input
              className="jeo-input"
              type="number"
              placeholder={`Wager (0 – ${Math.max(state.score, 1000)})`}
              value={state.finalWager}
              onChange={e => dispatch({ type: "set_wager", value: e.target.value } as JeopardyAction)}
            />
            <button
              className="jeo-btn wager"
              disabled={!state.finalWager}
              onClick={() => dispatch({ type: "submit_wager" } as JeopardyAction)}
            >
              Lock Wager
            </button>
          </div>
        )}

        {state.phase === "final_answer" && (
          <div className="jeo-answer-row">
            <input
              className="jeo-input"
              placeholder="What is…?"
              value={state.finalUserAnswer}
              onChange={e => dispatch({ type: "set_final_answer", value: e.target.value } as JeopardyAction)}
              onKeyDown={e => { if (e.key === "Enter") dispatch({ type: "submit_final" } as JeopardyAction); }}
            />
            <button
              className="jeo-btn primary"
              disabled={!state.finalUserAnswer}
              onClick={() => dispatch({ type: "submit_final" } as JeopardyAction)}
            >
              Submit
            </button>
          </div>
        )}

        {state.phase === "final_reveal" && (
          <>
            <div className={`jeo-reveal ${state.finalCorrect ? "correct" : "wrong"}`}>
              <div>{state.finalCorrect ? "Correct!" : "Incorrect."}</div>
              <div className="jeo-reveal-answer">Answer: {state.finalClue.answer}</div>
              <div>Wager: ${parseInt(state.finalWager) || 0} | New score: ${state.score.toLocaleString()}</div>
            </div>
            <button className="jeo-btn continue" onClick={() => dispatch({ type: "continue" } as JeopardyAction)}>
              See Final Score
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="jeo-wrap">
      <div className="jeo-header">
        <span className="jeo-title">Jeopardy</span>
        <span className="jeo-score">${state.score.toLocaleString()}</span>
      </div>

      {state.phase === "board" && (
        <div className="jeo-board">
          {state.categories.map((cat, ci) => (
            <div key={ci} className="jeo-cat-header">{cat.title}</div>
          ))}
          {[0, 1, 2, 3, 4].map(ri => (
            state.categories.map((cat, ci) => (
              <button
                key={`${ci}-${ri}`}
                className={`jeo-cell ${state.picked[ci]![ri] ? "used" : "available"}`}
                disabled={!!state.picked[ci]![ri]}
                onClick={() => dispatch({ type: "pick_clue", cat: ci, clue: ri } as JeopardyAction)}
              >
                {state.picked[ci]![ri] ? "" : `$${cat.clues[ri]!.value}`}
              </button>
            ))
          ))}
        </div>
      )}

      {(state.phase === "reading" || state.phase === "answering") && (
        <div className="jeo-reading-card">
          <div className="jeo-reading-value">
            {state.categories[state.activeCat]!.title} — ${state.categories[state.activeCat]!.clues[state.activeClue]!.value}
          </div>
          <div className="jeo-reading-question">
            {state.categories[state.activeCat]!.clues[state.activeClue]!.question}
          </div>
          {state.phase === "reading" && (
            <button className="jeo-btn continue" onClick={() => dispatch({ type: "continue" } as JeopardyAction)}>
              Answer
            </button>
          )}
        </div>
      )}

      {state.phase === "answering" && (
        <div className="jeo-answer-row">
          <input
            className="jeo-input"
            placeholder="What is…?"
            value={state.userAnswer}
            autoFocus
            onChange={e => dispatch({ type: "set_answer", value: e.target.value } as JeopardyAction)}
            onKeyDown={e => { if (e.key === "Enter") dispatch({ type: "submit_answer" } as JeopardyAction); }}
          />
          <button
            className="jeo-btn primary"
            disabled={!state.userAnswer}
            onClick={() => dispatch({ type: "submit_answer" } as JeopardyAction)}
          >
            Submit
          </button>
        </div>
      )}

      {state.phase === "reveal" && (
        <>
          <div className={`jeo-reveal ${state.lastCorrect ? "correct" : "wrong"}`}>
            <div>{state.lastCorrect ? `Correct! +$${state.categories[state.activeCat]!.clues[state.activeClue]!.value}` : `Wrong! -$${state.categories[state.activeCat]!.clues[state.activeClue]!.value}`}</div>
            <div className="jeo-reveal-answer">Answer: {state.categories[state.activeCat]!.clues[state.activeClue]!.answer}</div>
          </div>
          <button className="jeo-btn continue" onClick={() => dispatch({ type: "continue" } as JeopardyAction)}>
            Back to Board
          </button>
        </>
      )}
    </div>
  );
}
