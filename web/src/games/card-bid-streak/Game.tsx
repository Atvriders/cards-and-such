import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardBidStreakState, CardBidStreakAction, CardBidStreakSettings } from "./state.js";
import { cardName, isTerminal } from "./state.js";
import "./Game.css";

export function CardBidStreak({ state, dispatch, onGameOver }: GameProps<CardBidStreakState, CardBidStreakSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const isRed = (c: number) => { const s = Math.floor(c / 13); return s === 1 || s === 2; };

  return (
    <div className="cm-wrap">
      <div className="cm-round">Round {state.round} / {state.maxRounds}</div>
      <div className="cm-score">Coins: {state.coins} | Streak: {state.streak} | Best: {state.bestStreak}</div>
      {!terminal ? (
        <>
          <div className="cm-cards">
            <div className={`cm-card ${state.currentCard !== null && isRed(state.currentCard) ? "red" : ""}`}>
              {state.currentCard !== null ? cardName(state.currentCard) : "?"}
            </div>
          </div>
          {state.phase === "bidding" && (
            <>
              <div className="cm-prompt">Will the NEXT card be Higher or Lower?</div>
              <div className="cm-btns">
                <button className="cm-btn" onClick={() => dispatch({ type: "guess", higher: true } as CardBidStreakAction)}>Higher</button>
                <button className="cm-btn alt" onClick={() => dispatch({ type: "guess", higher: false } as CardBidStreakAction)}>Lower</button>
              </div>
            </>
          )}
          {state.phase === "revealed" && (
            <>
              <div className={`cm-result ${state.lastCorrect ? "good" : "bad"}`}>{state.lastCorrect ? "Correct! +" + (state.streak >= 3 ? 3 : 1) : "Wrong!"}</div>
              <button className="cm-btn" onClick={() => dispatch({ type: "next" } as CardBidStreakAction)}>Next</button>
            </>
          )}
        </>
      ) : (
        <div className="cm-done"><h2>Game Over!</h2><div className="cm-final">Coins: {state.coins} | Best Streak: {state.bestStreak}</div></div>
      )}
    </div>
  );
}
