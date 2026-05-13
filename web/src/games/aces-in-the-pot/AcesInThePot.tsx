import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AcesState, AcesAction, AcesSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./AcesInThePot.css";

const DICE_FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export function AcesInThePot({ state, dispatch, onGameOver }: GameProps<AcesState, AcesSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const finalWinner = state.gameOver
    ? (state.playerWins > state.botWins ? "player" : state.playerWins < state.botWins ? "bot" : "tie")
    : null;

  return (
    <div className="aces fade-in">
      <h2>Aces in the Pot</h2>
      <div className="aces-info">
        <span>Round: <strong>{state.round}/{state.maxRounds}</strong></span>
        <span>Wins — You: <strong>{state.playerWins}</strong>, Bot: <strong>{state.botWins}</strong></span>
      </div>

      <div className="aces-pennies">
        <span>🪙 You: <strong>{state.playerPennies}</strong></span>
        <span>🏦 Pot: <strong>{state.pot}</strong></span>
        <span>🤖 Bot: <strong>{state.botPennies}</strong></span>
      </div>

      <div className="aces-message">{state.message}</div>

      {state.lastRoll && (
        <div className="aces-dice">
          {state.lastRoll.map((d, i) => (
            <span key={i}>{DICE_FACES[d] ?? "?"}</span>
          ))}
        </div>
      )}

      {state.phase === "rolling" && (
        <button data-testid="hint-target-aces-in-the-pot-roll" className="aces-btn" onClick={() => dispatch({ type: "roll" } as AcesAction)}>
          Roll Dice
        </button>
      )}

      {state.phase === "roundOver" && !state.gameOver && (
        <button data-testid="hint-target-aces-in-the-pot-nextRound" className="aces-btn" onClick={() => dispatch({ type: "nextRound" } as AcesAction)}>
          Next Round →
        </button>
      )}

      {state.gameOver && finalWinner && (
        <div className={`aces-game-over ${finalWinner === "player" ? "win" : finalWinner === "bot" ? "loss" : ""}`}>
          {finalWinner === "player" ? "You win the game!" : finalWinner === "bot" ? "Bot wins!" : "Tie game!"}
          {" "}({state.playerWins}–{state.botWins})
        </div>
      )}
    </div>
  );
}
