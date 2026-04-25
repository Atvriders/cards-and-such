import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardColorStreakState, CardColorStreakSettings } from "./state.js";
import { isTerminal, cardRank, cardSuit, RANK_NAMES, SUIT_SYMS, isRed } from "./state.js";
import "./CardColorStreak.css";

export function CardColorStreak({ state, dispatch, onGameOver }: GameProps<CardColorStreakState, CardColorStreakSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const suit = cardSuit(state.currentCard);
  const red = isRed(state.currentCard);

  return (
    <div className="ccs-wrap">
      <div className="ccs-info">
        <span>Round {state.round}/{state.totalRounds}</span>
        <span>Score: {state.score}</span>
        <span>Streak: {state.streak}</span>
        <span>Best: {state.bestStreak}</span>
      </div>
      {!isTerminal(state) ? (
        <>
          <div className={`ccs-card ${red ? "red" : "black"}`}>
            {RANK_NAMES[cardRank(state.currentCard)]}{SUIT_SYMS[suit]}
          </div>
          {state.lastCorrect !== null && (
            <div className={`ccs-feedback ${state.lastCorrect ? "win" : "loss"}`}>
              {state.lastCorrect ? `+${5 + (state.streak - 1) * 2} Correct!` : "Wrong!"}
            </div>
          )}
          <p style={{ margin: 0, color: "#555", fontSize: ".9rem" }}>What color is the next card?</p>
          <div className="ccs-btns">
            <button className="ccs-btn red" onClick={() => dispatch({ type: "guess", color: "red" })}>Red ♥</button>
            <button className="ccs-btn black" onClick={() => dispatch({ type: "guess", color: "black" })}>Black ♠</button>
          </div>
        </>
      ) : (
        <div className="ccs-done">
          <h2>Game Over!</h2>
          <div className="ccs-final">Score: {state.score} | Best Streak: {state.bestStreak}</div>
        </div>
      )}
    </div>
  );
}
