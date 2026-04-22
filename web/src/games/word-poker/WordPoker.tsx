import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WordPokerState, WordPokerAction, WordPokerSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { scoreWord } from "./words.js";
import "./WordPoker.css";

export function WordPoker({ state, dispatch, onGameOver }: GameProps<WordPokerState, WordPokerSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) {
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  const {
    hand, selectedIds, currentWord, submittedWord, playerScore, botScore, botWord,
    playerWonRound, playerTotalWins, botTotalWins, round, maxRounds, roundOver, error
  } = state;

  const currentScore = currentWord.length >= 3 ? scoreWord(currentWord) : 0;

  return (
    <div className="wp-wrap">
      <div className="wp-header">
        <span>Round {round} / {maxRounds}</span>
        <span className="wp-wins">You: {playerTotalWins} wins</span>
        <span className="wp-bot-wins">Bot: {botTotalWins} wins</span>
      </div>

      <div className="wp-hand">
        {hand.map(card => (
          <div
            key={card.id}
            className={`wp-card${selectedIds.includes(card.id) ? " selected" : ""}`}
            onClick={() => !roundOver && dispatch({ type: "toggleCard", id: card.id } as WordPokerAction)}
          >
            {card.letter}
            <span className="wp-card-value">{card.value}</span>
          </div>
        ))}
      </div>

      <div className="wp-current-word">{currentWord || "—"}</div>
      {currentWord.length >= 3 && (
        <div className="wp-word-score">Word value: {currentScore}</div>
      )}

      <div className="wp-error">{error ?? " "}</div>

      <div className="wp-actions">
        {!roundOver ? (
          <>
            <button
              className="wp-btn submit"
              disabled={currentWord.length < 3}
              onClick={() => dispatch({ type: "submit" } as WordPokerAction)}
            >
              Submit
            </button>
            <button
              className="wp-btn clear"
              disabled={selectedIds.length === 0}
              onClick={() => dispatch({ type: "clearSelection" } as WordPokerAction)}
            >
              Clear
            </button>
          </>
        ) : (
          <button
            className="wp-btn next"
            onClick={() => dispatch({ type: "nextRound" } as WordPokerAction)}
          >
            {round >= maxRounds ? "See Final Score" : "Next Round"}
          </button>
        )}
      </div>

      {roundOver && submittedWord && (
        <div className={`wp-result ${playerWonRound ? "player-won" : "bot-won"}`}>
          <h3>{playerWonRound ? "You win this round!" : "Bot wins this round!"}</h3>
          <div className="wp-comparison">
            <div>
              <div className="label">Your word</div>
              <div className="word-val">{submittedWord}</div>
              <div className="score-val">{playerScore} pts</div>
            </div>
            <div>
              <div className="label">Bot&apos;s word</div>
              <div className="word-val">{botWord || "(none)"}</div>
              <div className="score-val">{botScore} pts</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
