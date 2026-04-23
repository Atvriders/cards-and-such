import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RideTheBusState, RideTheBusSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Game.css";

type RideTheBusAction =
  | { type: "guess"; value: string }
  | { type: "nextQuestion" }
  | { type: "nextRound" };

const QUESTION_LABELS = ["Red or Black?", "Higher or Lower?", "Inside or Outside?", "Guess the Suit!"];
const QUESTION_ANSWERS = [
  ["red", "black"],
  ["higher", "lower"],
  ["inside", "outside"],
  ["♠", "♥", "♦", "♣"],
];
const ANSWER_LABELS: Record<string, string> = {
  red: "Red", black: "Black", higher: "Higher", lower: "Lower",
  inside: "Inside", outside: "Outside", "♠": "♠ Spades", "♥": "♥ Hearts", "♦": "♦ Diamonds", "♣": "♣ Clubs",
};

export function RideTheBusGame({ state, dispatch, onGameOver }: GameProps<RideTheBusState, RideTheBusSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { currentQuestion, phase, lastGuess, lastCorrect, drinks, revealedCards, currentReveal, roundsPlayed, settings } = state;

  const qLabel = QUESTION_LABELS[currentQuestion] ?? "";
  const answers = QUESTION_ANSWERS[currentQuestion] ?? [];
  const maxDrinks = parseInt(settings.rounds, 10) * 4;

  return (
    <div className="rtb">
      <div className="rtb-header">
        <h2>Ride the Bus</h2>
        <div className="rtb-progress">Round {roundsPlayed + 1}/{settings.rounds} · Penalties: {drinks}/{maxDrinks}</div>
      </div>

      <div className="rtb-revealed">
        <div className="rtb-revealed-label">Cards this round:</div>
        <div className="rtb-revealed-cards">
          {revealedCards.map(c => <Card key={c.id} card={c} />)}
          {currentReveal && phase === "reveal" && <Card key={currentReveal.id} card={currentReveal} />}
          {phase === "question" && [...Array(3 - revealedCards.length)].map((_, i) => (
            <Card key={`facedown-${i}`} faceDown />
          ))}
        </div>
      </div>

      {phase === "question" && (
        <div className="rtb-question">
          <div className="rtb-q-label">Question {currentQuestion + 1}: <strong>{qLabel}</strong></div>
          <div className="rtb-answers">
            {answers.map(a => (
              <button key={a} className="rtb-answer-btn"
                onClick={() => dispatch({ type: "guess", value: a } as RideTheBusAction)}>
                {ANSWER_LABELS[a] ?? a}
              </button>
            ))}
          </div>
          {revealedCards.length >= 1 && currentQuestion === 1 && (
            <div className="rtb-hint">Previous card: {revealedCards[0]!.rank} of {revealedCards[0]!.suit}</div>
          )}
          {revealedCards.length >= 2 && currentQuestion === 2 && (
            <div className="rtb-hint">Range: {revealedCards[0]!.rank}–{revealedCards[1]!.rank}</div>
          )}
        </div>
      )}

      {phase === "reveal" && currentReveal && (
        <div className="rtb-reveal">
          <div className={`rtb-reveal-result ${lastCorrect ? "correct" : "wrong"}`}>
            {lastCorrect ? "Correct! No penalty." : "Wrong! +1 penalty point."}
          </div>
          <div className="rtb-reveal-detail">You guessed: {ANSWER_LABELS[lastGuess ?? ""] ?? lastGuess}</div>
          <button className="rtb-btn next"
            onClick={() => dispatch({ type: "nextQuestion" } as RideTheBusAction)}>
            {currentQuestion < 3 ? "Next Question" : "End Round"}
          </button>
        </div>
      )}

      {phase === "roundEnd" && (
        <div className="rtb-round-end">
          <div className="rtb-round-summary">Round complete! Penalties so far: {drinks}</div>
          <button className="rtb-btn next" onClick={() => dispatch({ type: "nextRound" } as RideTheBusAction)}>
            Next Round
          </button>
        </div>
      )}

      {phase === "done" && (
        <div className="rtb-done">
          <h3>Game Over!</h3>
          <div>Total penalties: {drinks} / {maxDrinks}</div>
          <div className="rtb-score-label">Score: {terminal?.score ?? 0} / 100</div>
          <div>{(terminal?.score ?? 0) >= 70 ? "Great guessing!" : (terminal?.score ?? 0) >= 40 ? "Not bad!" : "Better luck next time."}</div>
        </div>
      )}
    </div>
  );
}
