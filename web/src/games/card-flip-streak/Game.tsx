import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardFlipStreakState, CardFlipStreakAction, CardFlipStreakSettings } from "./state.js";
import { cardName, isRed, isTerminal } from "./state.js";
import "./Game.css";

export function CardFlipStreak({ state, dispatch, onGameOver }: GameProps<CardFlipStreakState, CardFlipStreakSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  return (
    <div className="cm-wrap">
      <div className="cm-round">Round {state.round} / {state.maxRounds}</div>
      <div className="cm-score">Score: {state.score} | Streak: {state.streak} | Best: {state.bestStreak}</div>
      {!terminal ? (
        <>
          <div className="cm-cards">
            {state.flipped !== null
              ? <div className={`cm-card ${isRed(state.flipped) ? "red" : ""}`}>{cardName(state.flipped)}</div>
              : <div className="cm-card back">?</div>}
          </div>
          {state.phase === "picking" && (
            <>
              <div className="cm-prompt">Flip for a Red card — build your streak!</div>
              <button data-testid="hint-target-card-flip-streak-primary" className="cm-btn" onClick={() => dispatch({ type: "flip" } as CardFlipStreakAction)}>Flip</button>
            </>
          )}
          {state.phase === "revealed" && (
            <>
              <div className={`cm-result ${state.lastRed ? "good" : "bad"}`}>{state.lastRed ? `Red! +${state.streak >= 3 ? 5 : 2}` : "Black — streak reset!"}</div>
              <button className="cm-btn" onClick={() => dispatch({ type: "next" } as CardFlipStreakAction)}>Next</button>
            </>
          )}
        </>
      ) : (
        <div className="cm-done"><h2>Done!</h2><div className="cm-final">Score: {state.score} | Best Streak: {state.bestStreak}</div></div>
      )}
    </div>
  );
}
