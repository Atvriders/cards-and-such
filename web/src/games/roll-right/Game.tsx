import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RollRightState, RollRightSettings } from "./state.js";
import { isTerminal, GOAL } from "./state.js";
import "./Game.css";

const DICE_FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export function RollRightGame({ state, dispatch, onGameOver }: GameProps<RollRightState, RollRightSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const isHuman = state.currentPlayer === 0;
  const canRoll = isHuman && state.phase === "select" && state.winner === null;
  const canScore = isHuman && state.phase === "select" && state.rollsThisTurn > 0 && state.winner === null;
  const canConfirm = state.phase === "scored" && state.winner === null;

  return (
    <div className="roll-right">
      <div className="rr-scores">
        <div className={`rr-score-item ${state.currentPlayer === 0 ? "active" : ""}`}>
          <div className="rr-score-label">You</div>
          <div className="rr-score-value">{state.scores[0]}</div>
        </div>
        <div className="rr-goal">/ {GOAL}</div>
        <div className={`rr-score-item ${state.currentPlayer === 1 ? "active" : ""}`}>
          <div className="rr-score-label">Bot</div>
          <div className="rr-score-value">{state.scores[1]}</div>
        </div>
      </div>

      {state.winner !== null ? (
        <div className="rr-winner">{state.winner === 0 ? "You win!" : "Bot wins!"}</div>
      ) : (
        <div className="rr-turn-info">
          {isHuman
            ? state.rollsThisTurn === 0 ? "Click Roll to start your turn." : `Rolled ${state.rollsThisTurn}x — click dice to keep, then Score.`
            : "Bot's turn…"}
        </div>
      )}

      <div className="rr-dice">
        {state.dice.map((face, i) => (
          <div
            key={i}
            className={`rr-die${state.kept[i] ? " kept" : ""}${canScore && !state.kept[i] ? " selectable" : ""}`}
            onClick={() => {
              if (canScore) dispatch({ type: "toggleKeep", index: i });
            }}
            title={state.kept[i] ? "Kept (click to unkeep)" : canScore ? "Click to keep" : ""}
          >
            {DICE_FACES[face] ?? face}
          </div>
        ))}
      </div>

      {state.phase === "scored" && state.winner === null && (
        <div className="rr-turn-info">
          {state.currentPlayer === 1 ? `Bot scored ${state.turnScore} this turn.` : `You scored ${state.turnScore} this turn.`}
        </div>
      )}

      <div className="rr-controls">
        {canRoll && (
          <button data-testid="hint-target-roll-right-roll" onClick={() => dispatch({ type: "roll" })}>
            {state.rollsThisTurn === 0 ? "Roll Dice" : "Re-roll Unkept"}
          </button>
        )}
        {canScore && (
          <button data-testid="hint-target-roll-right-score" onClick={() => dispatch({ type: "score" })}>
            Score {state.kept.some(Boolean) ? `Kept (${state.dice.reduce((s, v, i) => s + (state.kept[i] ? v : 0), 0)})` : "All"}
          </button>
        )}
        {canConfirm && state.currentPlayer === 1 && (
          <button data-testid="hint-target-roll-right-confirm" onClick={() => dispatch({ type: "confirm" })}>Next Turn</button>
        )}
        {canConfirm && state.currentPlayer === 0 && (
          <button data-testid="hint-target-roll-right-confirm" onClick={() => dispatch({ type: "confirm" })}>Continue</button>
        )}
        {!isHuman && state.winner === null && state.phase !== "scored" && (
          <div className="rr-bot-label">Bot is thinking…</div>
        )}
      </div>

      <div className="rr-hint">Click a die to mark it kept (green). Only kept dice score.</div>
    </div>
  );
}
