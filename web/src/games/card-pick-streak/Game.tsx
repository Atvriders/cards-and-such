import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardPickStreakState, CardPickStreakAction, CardPickStreakSettings } from "./state.js";
import { cardName, isTerminal } from "./state.js";
import "./Game.css";

export function CardPickStreak({ state, dispatch, onGameOver }: GameProps<CardPickStreakState, CardPickStreakSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const isRed = (c: number) => { const s = Math.floor(c / 13); return s === 1 || s === 2; };
  const [a, b] = state.options;

  return (
    <div className="cm-wrap">
      <div className="cm-round">Round {state.round} / {state.maxRounds}</div>
      <div className="cm-score">Score: {state.score} | Streak: {state.streak} | Best: {state.bestStreak}</div>
      {!terminal ? (
        <>
          <div className="cm-prompt">{state.phase === "picking" ? "Pick the higher card!" : state.lastCorrect ? "Correct!" : "Wrong!"}</div>
          <div className="cm-cards">
            <button
              className={`cm-card ${isRed(a) ? "red" : ""}`}
              disabled={state.phase !== "picking"}
              onClick={() => dispatch({ type: "pick", index: 0 } as CardPickStreakAction)}
            >
              {state.phase === "picking" && state.chosen === null ? "?" : cardName(a)}
            </button>
            <button
              className={`cm-card ${isRed(b) ? "red" : ""}`}
              disabled={state.phase !== "picking"}
              onClick={() => dispatch({ type: "pick", index: 1 } as CardPickStreakAction)}
            >
              {state.phase === "picking" && state.chosen === null ? "?" : cardName(b)}
            </button>
          </div>
          {state.phase === "revealed" && (
            <button data-testid="hint-target-card-pick-streak-primary" className="cm-btn" onClick={() => dispatch({ type: "next" } as CardPickStreakAction)}>Next</button>
          )}
        </>
      ) : (
        <div className="cm-done"><h2>Done!</h2><div className="cm-final">Score: {state.score} | Best Streak: {state.bestStreak}</div></div>
      )}
    </div>
  );
}
