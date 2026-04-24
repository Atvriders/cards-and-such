import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CashCabState, CashCabAction, CashCabSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function CashCab({ state, dispatch, onGameOver }: GameProps<CashCabState, CashCabSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  if (state.phase === "intro") {
    return (
      <div className="cc-wrap">
        <div className="cc-intro">
          <h2>Cash Cab</h2>
          <p>
            You start with $50 and answer trivia questions. Each correct answer doubles your cash.
            Each wrong answer costs you $50. After every question, you can stop and keep your winnings
            or risk it for the next question.
          </p>
          <button className="cc-start-btn" onClick={() => dispatch({ type: "start" } as CashCabAction)}>
            Start the Ride!
          </button>
        </div>
      </div>
    );
  }

  if (state.phase === "done" || state.phase === "stopped") {
    const totalQ = state.questions.length;
    const reached = state.questionIndex;
    return (
      <div className="cc-wrap">
        <div className="cc-done">
          <h2>{state.phase === "stopped" ? "You Cashed Out!" : "End of the Line!"}</h2>
          <div className="cc-done-cash">${state.cash.toLocaleString()}</div>
          <p className="cc-potential">
            {state.phase === "stopped"
              ? `You stopped after question ${reached} of ${totalQ}.`
              : `You answered all ${totalQ} questions!`}
          </p>
          <p style={{ color: state.cash >= 1000 ? "#1e8449" : "#888", fontWeight: 600, marginTop: 8 }}>
            {state.cash >= 10000 ? "Incredible ride!" : state.cash >= 1000 ? "Great ride!" : state.cash >= 200 ? "Decent ride!" : "Better luck next time!"}
          </p>
        </div>
      </div>
    );
  }

  const q = state.questions[state.questionIndex]!;
  const totalQ = state.questions.length;
  const maxPossible = state.cash * Math.pow(2, totalQ - state.questionIndex);

  return (
    <div className="cc-wrap">
      <div className="cc-header">
        <span className="cc-title">Cash Cab</span>
        <span className="cc-cash">${state.cash.toLocaleString()}</span>
      </div>

      <div className="cc-progress">
        Question {state.questionIndex + 1} of {totalQ}
      </div>

      <div className="cc-category">{q.category}</div>

      <div className="cc-question-card">{q.question}</div>

      {state.phase === "playing" && (
        <div className="cc-options">
          {q.options.map((opt, i) => (
            <button
              key={i}
              className="cc-option"
              onClick={() => dispatch({ type: "answer", choice: i as 0 | 1 | 2 | 3 } as CashCabAction)}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {state.phase === "answered" && (
        <>
          <div className={`cc-result ${state.lastCorrect ? "correct" : "wrong"}`}>
            {state.lastCorrect
              ? `Correct! Your cash doubled to $${state.cash.toLocaleString()}`
              : `Wrong! The answer was "${state.correctAnswer}". Cash: $${state.cash.toLocaleString()}`}
          </div>

          {state.questionIndex + 1 < totalQ ? (
            <>
              <p style={{ color: "#555", fontSize: "0.9rem", textAlign: "center" }}>
                You could earn up to ${maxPossible.toLocaleString()} if you get every remaining question right.
              </p>
              <div className="cc-actions">
                <button
                  className="cc-btn stop"
                  onClick={() => dispatch({ type: "stop_and_keep" } as CashCabAction)}
                >
                  Stop &amp; Keep ${state.cash.toLocaleString()}
                </button>
                <button
                  className="cc-btn continue"
                  onClick={() => dispatch({ type: "continue_ride" } as CashCabAction)}
                >
                  Continue Riding
                </button>
              </div>
            </>
          ) : (
            <button
              className="cc-btn continue"
              onClick={() => dispatch({ type: "continue_ride" } as CashCabAction)}
            >
              See Final Total
            </button>
          )}
        </>
      )}
    </div>
  );
}
