import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DicePokerState, DicePokerAction, DicePokerSettings } from "./state.js";
import { isTerminal, HAND_LABELS, faceLabel } from "./state.js";
import "./DicePoker.css";

export function DicePoker({
  state,
  dispatch,
  onGameOver,
}: GameProps<DicePokerState, DicePokerSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const canRoll = (state.phase === "playerRoll" || state.phase === "playerReroll") && state.playerRollsUsed < 3;
  const canBank = state.phase === "playerReroll" && state.playerRollsUsed > 0;
  const botTurnAuto = state.phase === "botTurn";

  useEffect(() => {
    if (botTurnAuto) {
      dispatch({ type: "bank" } as DicePokerAction);
    }
  }, [botTurnAuto, dispatch]);

  function handleToggle(index: number) {
    if (state.phase === "playerReroll") {
      dispatch({ type: "toggleKeep", index } as DicePokerAction);
    }
  }

  return (
    <div className="dp">
      <div className="dp-header">
        <h2>Dice Poker</h2>
        <div className="dp-scores">
          <span>You: <strong>{state.playerScore}</strong></span>
          <span> / </span>
          <span>Bot: <strong>{state.botScore}</strong></span>
          <span className="dp-target">First to {state.settings.winScore}</span>
        </div>
      </div>

      <div className="dp-round">Round {state.round}</div>

      <div className="dp-message">{state.message}</div>

      {/* Player dice */}
      <div className="dp-section">
        <div className="dp-label">Your Dice</div>
        <div className="dp-dice">
          {state.playerDice.map((die, i) => (
            <div
              key={i}
              className={`dp-die ${die.kept ? "kept" : ""} ${state.phase === "playerReroll" ? "clickable" : ""}`}
              onClick={() => handleToggle(i)}
            >
              {faceLabel(die.value)}
            </div>
          ))}
        </div>
        {state.playerHand && (
          <div className="dp-hand-label">{HAND_LABELS[state.playerHand]}</div>
        )}
      </div>

      {/* Bot dice — shown after result */}
      {(state.phase === "result" || state.phase === "gameOver") && (
        <div className="dp-section">
          <div className="dp-label">Bot's Dice</div>
          <div className="dp-dice">
            {state.botDice.map((die, i) => (
              <div key={i} className="dp-die">{faceLabel(die.value)}</div>
            ))}
          </div>
          {state.botHand && (
            <div className="dp-hand-label">{HAND_LABELS[state.botHand]}</div>
          )}
        </div>
      )}

      <div className="dp-controls">
        {canRoll && (
          <button className="dp-btn" onClick={() => dispatch({ type: "roll" } as DicePokerAction)}>
            {state.playerRollsUsed === 0 ? "Roll Dice" : `Re-roll (${3 - state.playerRollsUsed} left)`}
          </button>
        )}
        {canBank && (
          <button className="dp-btn secondary" onClick={() => dispatch({ type: "bank" } as DicePokerAction)}>
            Bank This Hand
          </button>
        )}
        {state.phase === "result" && !state.winner && (
          <button className="dp-btn" onClick={() => dispatch({ type: "nextRound" } as DicePokerAction)}>
            Next Round →
          </button>
        )}
      </div>

      {state.winner && (
        <div className={`dp-game-over ${state.winner === "player" ? "win" : "loss"}`}>
          {state.winner === "player"
            ? `You win! ${state.playerScore}-${state.botScore}`
            : `Bot wins! ${state.botScore}-${state.playerScore}`}
        </div>
      )}
    </div>
  );
}
