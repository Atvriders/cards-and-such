import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MillionaireState, MillionaireAction, MillionaireSettings } from "./state.js";
import { PRIZES, isTerminal } from "./state.js";
import "./Game.css";

const LETTERS = ["A", "B", "C", "D"];
const SAFETY_PRIZE_INDICES = [3, 8]; // $1000 and $32000

export function Millionaire({ state, dispatch, onGameOver }: GameProps<MillionaireState, MillionaireSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const fmtPrize = (n: number) => `$${n.toLocaleString()}`;

  if (state.phase === "wrong") {
    return (
      <div className="mil-wrap">
        <div className="mil-end">
          <h2>Wrong Answer!</h2>
          <p>You fall back to your safety net.</p>
          <div className="mil-end-prize">{fmtPrize(state.score)}</div>
          <p style={{ color: "#888", fontSize: "0.9rem" }}>
            The correct answer was: {state.questions[state.level - 0]?.options[state.questions[state.level - 0]?.correct ?? 0] ?? ""}
          </p>
        </div>
      </div>
    );
  }

  if (state.phase === "won") {
    return (
      <div className="mil-wrap">
        <div className="mil-end">
          <h2>You Won!</h2>
          <div className="mil-end-prize">{fmtPrize(state.score)}</div>
          <p style={{ color: "#d4af37", fontWeight: 700 }}>Congratulations — you answered all 14 questions correctly!</p>
        </div>
      </div>
    );
  }

  if (state.phase === "walk_away") {
    return (
      <div className="mil-wrap">
        <div className="mil-end">
          <h2>You Walked Away</h2>
          <div className="mil-end-prize">{fmtPrize(state.score)}</div>
          <p style={{ color: "#888" }}>Smart move — you keep what you earned!</p>
        </div>
      </div>
    );
  }

  const q = state.questions[state.level];
  if (!q) return <div className="mil-wrap"><div className="mil-end"><h2>Loading…</h2></div></div>;

  const lifelineAvailable = state.settings.lifelines === "all";

  if (state.phase === "lifeline_audience") {
    const letters = ["A", "B", "C", "D"];
    return (
      <div className="mil-wrap">
        <div className="mil-overlay">
          <h3>Ask the Audience</h3>
          <div className="mil-audience-bars">
            {state.audienceVotes.map((pct, i) => (
              <div key={i} className="mil-bar-wrap">
                <div className="mil-bar-pct">{pct}%</div>
                <div className="mil-bar" style={{ height: `${pct * 0.7}px` }} />
                <div className="mil-bar-label">{letters[i]}</div>
              </div>
            ))}
          </div>
          <button className="mil-dismiss-btn" onClick={() => dispatch({ type: "dismiss_lifeline" } as MillionaireAction)}>
            Back to Question
          </button>
        </div>
      </div>
    );
  }

  if (state.phase === "lifeline_phone") {
    return (
      <div className="mil-wrap">
        <div className="mil-overlay">
          <h3>Phone a Friend</h3>
          <p className="mil-phone-text">{state.phoneHint}</p>
          <button className="mil-dismiss-btn" onClick={() => dispatch({ type: "dismiss_lifeline" } as MillionaireAction)}>
            Back to Question
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mil-wrap">
      <div className="mil-header">
        <span className="mil-title">Millionaire</span>
        <span className="mil-score-box">{fmtPrize(state.score)}</span>
      </div>

      <div className="mil-ladder">
        {PRIZES.map((prize, i) => {
          const isCurrent = i === state.level;
          const isPassed = i < state.level;
          const isSafety = SAFETY_PRIZE_INDICES.includes(i);
          return (
            <div
              key={i}
              className={`mil-ladder-row ${isCurrent ? "current" : ""} ${isPassed ? "passed" : ""} ${isSafety && !isCurrent && !isPassed ? "safety" : ""}`}
            >
              <span className="mil-ladder-num">{i + 1}</span>
              <span className="mil-ladder-prize">{fmtPrize(prize)}</span>
              {isSafety && !isCurrent && !isPassed && <span style={{ fontSize: "0.7rem", color: "#e67e22" }}>★ safe</span>}
            </div>
          );
        })}
      </div>

      <div className="mil-question-card">{q.question}</div>

      <div className="mil-options">
        {q.options.map((opt, i) => (
          <button
            key={i}
            className="mil-option"
            disabled={state.eliminated[i]}
            onClick={() => dispatch({ type: "answer", choice: i as 0 | 1 | 2 | 3 } as MillionaireAction)}
          >
            <span className="mil-option-letter">{LETTERS[i]}</span>
            {opt}
          </button>
        ))}
      </div>

      <div className="mil-lifelines">
        {lifelineAvailable && (
          <>
            <button
              className="mil-lifeline-btn"
              disabled={state.lifeline5050Used}
              onClick={() => dispatch({ type: "use_5050" } as MillionaireAction)}
            >
              50:50
            </button>
            <button
              className="mil-lifeline-btn"
              disabled={state.lifelineAudienceUsed}
              onClick={() => dispatch({ type: "use_audience" } as MillionaireAction)}
            >
              Ask Audience
            </button>
            <button
              className="mil-lifeline-btn"
              disabled={state.lifelinePhoneUsed}
              onClick={() => dispatch({ type: "use_phone" } as MillionaireAction)}
            >
              Phone Friend
            </button>
          </>
        )}
        {state.level > 0 && (
          <button className="mil-walk-btn" onClick={() => dispatch({ type: "walk_away" } as MillionaireAction)}>
            Walk Away
          </button>
        )}
      </div>
    </div>
  );
}
