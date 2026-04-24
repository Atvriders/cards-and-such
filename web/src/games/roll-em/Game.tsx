import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RollEmState, RollEmSettings, RollEmAction } from "./state.js";
import { isTerminal, evaluateHand } from "./state.js";
import "./Game.css";

const DIE_FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export function RollEm({
  state,
  dispatch,
  onGameOver,
}: GameProps<RollEmState, RollEmSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const current = state.current;
  const currentHand = evaluateHand(current.dice);
  const lastRound = state.history[state.history.length - 1];
  const lastBotRound = state.botHistory[state.botHistory.length - 1];
  const showResult = state.gameOver || state.round > 1;

  return (
    <div className="re-game">
      <div className="re-title">Roll 'Em</div>
      <div className="re-stats">
        <span>Round {Math.min(state.round, state.totalRounds)} / {state.totalRounds}</span>
        <span>Score: <strong>{state.totalScore}</strong></span>
        <span>Rolls left: {current.rollsLeft}</span>
      </div>

      {/* Dice */}
      <div className="re-dice-row">
        {current.dice.map((val, i) => (
          <button
            key={i}
            className={`re-die ${current.kept[i] ? "kept" : ""}`}
            onClick={() => dispatch({ type: "toggleKeep", index: i } as RollEmAction)}
            title={current.kept[i] ? "Kept — click to unkeep" : "Click to keep"}
          >
            {DIE_FACES[val]}
          </button>
        ))}
      </div>

      <div className="re-hand-name">{currentHand.label}</div>

      {!state.gameOver && (
        <div className="re-actions">
          {current.rollsLeft > 0 && (
            <button className="re-btn roll-btn" onClick={() => dispatch({ type: "roll" } as RollEmAction)}>
              Roll ({current.rollsLeft} left)
            </button>
          )}
          <button className="re-btn end-btn" onClick={() => dispatch({ type: "endTurn" } as RollEmAction)}>
            End Turn
          </button>
        </div>
      )}

      {/* Last round results */}
      {showResult && lastRound && lastBotRound && (
        <div className="re-last-result">
          <div className={`re-vs-row ${lastRound.score >= lastBotRound.score ? "win" : "loss"}`}>
            <span>You: {lastRound.label} ({lastRound.score})</span>
            <span>vs</span>
            <span>Bot: {lastBotRound.label} ({lastBotRound.score})</span>
          </div>
        </div>
      )}

      {/* Hand history */}
      {state.history.length > 0 && (
        <div className="re-history">
          <div className="re-history-label">History</div>
          {state.history.map((h, i) => {
            const bh = state.botHistory[i];
            return (
              <div key={i} className={`re-history-row ${h.score >= (bh?.score ?? 0) ? "win" : "loss"}`}>
                <span>Rd {i + 1}: {h.label}</span>
                <span>Bot: {bh?.label ?? "-"}</span>
              </div>
            );
          })}
        </div>
      )}

      {state.gameOver && (
        <div className="re-game-over">
          <div>Game Over!</div>
          <div>Total: {terminal?.score} pts</div>
          <button className="re-btn roll-btn" onClick={() => dispatch({ type: "restart" } as RollEmAction)}>
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
