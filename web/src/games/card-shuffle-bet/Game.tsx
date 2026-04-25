import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardShuffleBetState, CardShuffleBetAction, CardShuffleBetSettings } from "./state.js";
import { isTerminal, cardName } from "./state.js";
import "./Game.css";

export function CardShuffleBet({ state, dispatch, onGameOver }: GameProps<CardShuffleBetState, CardShuffleBetSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "gameover") {
    return <div className="card-game-wrap"><h2>Game Over!</h2><p>Score: <strong>{state.score}</strong></p></div>;
  }

  const isMemorize = state.phase === "memorize";
  const isGuess = state.phase === "guess";
  const isResult = state.phase === "result";
  const orderedCards = state.positions.map(p => state.cards[p]!);

  return (
    <div className="card-game-wrap">
      <div className="card-game-header"><span>Round {state.round}/{state.maxRounds}</span><span>Score: {state.score}</span></div>
      {isMemorize && <p style={{ fontWeight: 700, color: "#3498db" }}>Memorize! Which card is highest?</p>}
      {isGuess && <p style={{ fontWeight: 700, color: "#e74c3c" }}>Cards shuffled! Where is the highest card?</p>}
      {isResult && <p className={`result-msg ${state.guess === state.highestPos ? "win" : "lose"}`}>{state.guess === state.highestPos ? "+40 pts!" : `Wrong! It was position ${state.highestPos + 1}`}</p>}
      <div className="card-game-cards" style={{ gap: "12px" }}>
        {[0, 1, 2].map(i => (
          <button key={i} className={`playing-card${isResult && i === state.highestPos ? " card-win" : ""}${isResult && i === state.guess && i !== state.highestPos ? " card-lose" : ""}`}
            style={{ fontSize: "1.4rem", cursor: isGuess ? "pointer" : "default", minWidth: "64px" }}
            disabled={!isGuess}
            onClick={() => dispatch({ type: "guess", pos: i } as CardShuffleBetAction)}>
            {isMemorize || isResult ? cardName(orderedCards[i]!) : "?"}
          </button>
        ))}
      </div>
      {isMemorize && <button className="bet-btn" onClick={() => dispatch({ type: "ready" } as CardShuffleBetAction)}>Shuffle!</button>}
      {isResult && <button className="bet-btn" onClick={() => dispatch({ type: "next" } as CardShuffleBetAction)}>Next</button>}
    </div>
  );
}
