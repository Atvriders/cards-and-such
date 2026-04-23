import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WYRState, WYRAction, WYRSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function WouldYouRather({ state, dispatch, onGameOver }: GameProps<WYRState, WYRSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  if (state.phase === "done") {
    const pct = Math.round((state.majorityMatches / state.dilemmas.length) * 100);
    return (
      <div className="wyr-wrap">
        <div className="wyr-done">
          <h2>Game Over!</h2>
          <p>You agreed with the majority on <strong>{state.majorityMatches} / {state.dilemmas.length}</strong> dilemmas ({pct}%).</p>
          <p style={{ fontSize: "0.9rem", color: "#888" }}>Score = majority matches</p>
        </div>
      </div>
    );
  }

  const d = state.dilemmas[state.currentIndex]!;
  const isResult = state.phase === "result";
  const pctA = d.percentA;
  const pctB = 100 - pctA;
  const agreedWithMajority = state.chosen === "A" ? pctA >= 50 : pctA < 50;

  return (
    <div className="wyr-wrap">
      <div className="wyr-header">
        <span>Q {state.currentIndex + 1} / {state.dilemmas.length}</span>
        <span className="wyr-majority">Majority matches: {state.majorityMatches}</span>
      </div>

      <div className="wyr-prompt">Would You Rather…</div>

      <div className="wyr-options">
        <button
          className={`wyr-option${isResult && state.chosen === "A" ? " chosen-a" : ""}`}
          disabled={isResult}
          onClick={() => dispatch({ type: "choose", option: "A" } as WYRAction)}
        >
          <span className="wyr-option-label">Option A</span>
          {d.optionA}
        </button>
        <span className="wyr-or">OR</span>
        <button
          className={`wyr-option${isResult && state.chosen === "B" ? " chosen-b" : ""}`}
          disabled={isResult}
          onClick={() => dispatch({ type: "choose", option: "B" } as WYRAction)}
        >
          <span className="wyr-option-label">Option B</span>
          {d.optionB}
        </button>
      </div>

      {isResult && (
        <>
          <div className="wyr-bar-wrap">
            <div className="wyr-bar-label">
              <span style={{ color: "#2980b9" }}>A: {pctA}%</span>
              <span style={{ color: "#e67e22" }}>B: {pctB}%</span>
            </div>
            <div className="wyr-bar">
              <div className="wyr-bar-a" style={{ width: `${pctA}%` }} />
              <div className="wyr-bar-b" />
            </div>
          </div>
          <div className={`wyr-majority-msg ${agreedWithMajority ? "match" : "diff"}`}>
            {agreedWithMajority ? "You agree with the majority!" : "You disagree with the majority!"}
          </div>
          <button
            className="wyr-btn"
            onClick={() => dispatch({ type: "next" } as WYRAction)}
          >
            {state.currentIndex + 1 >= state.dilemmas.length ? "Finish" : "Next"}
          </button>
        </>
      )}
    </div>
  );
}
