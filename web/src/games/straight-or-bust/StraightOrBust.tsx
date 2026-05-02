import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { StraightOrBustState, StraightOrBustAction, StraightOrBustSettings } from "./state.js";
import { isTerminal, checkStraight } from "./state.js";
import { Die } from "../../engines/dice/Die.js";
import "./StraightOrBust.css";

export function StraightOrBust({
  state,
  dispatch,
  onGameOver,
}: GameProps<StraightOrBustState, StraightOrBustSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const maxRounds = parseInt(state.settings.rounds, 10);
  const { straight } = state.phase === "done" || state.rollsUsed > 0
    ? checkStraight(state.dice)
    : { straight: false };

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const canRoll = state.phase !== "done" && state.rollsUsed < 3 && !state.gameOver;
  const canToggle = state.phase === "rolling" && state.rollsUsed < 3;
  const lastResult = state.roundResults[state.roundResults.length - 1];

  return (
    <div className="straight-or-bust">
      <h2>STRAIGHT OR BUST</h2>

      <div className="sob-header">
        <div>Round <span>{Math.min(state.round, maxRounds)}</span> / <span>{maxRounds}</span></div>
        <div>Rolls: <span>{state.rollsUsed}</span> / 3</div>
        <div>Total: <span>{state.totalScore}</span></div>
      </div>

      <div className="sob-dice-row">
        {state.dice.map((die, i) => (
          <Die
            key={i}
            value={die.value}
            kept={die.kept}
            onClick={canToggle ? () => dispatch({ type: "toggleKeep", index: i } as StraightOrBustAction) : undefined}
          />
        ))}
      </div>

      <div className="sob-controls">
        {canRoll && (
          <button data-testid="hint-target-straight-or-bust-roll" onClick={() => dispatch({ type: "roll" } as StraightOrBustAction)}>
            {state.rollsUsed === 0 ? "Roll" : `Re-roll (${3 - state.rollsUsed} left)`}
          </button>
        )}
        {state.phase === "done" && !state.gameOver && (
          <button data-testid="hint-target-straight-or-bust-nextRound" onClick={() => dispatch({ type: "nextRound" } as StraightOrBustAction)}>
            Next Round
          </button>
        )}
      </div>

      {state.phase === "done" && lastResult && (
        <div className="sob-result-panel">
          <div className={`sob-result ${lastResult.straight ? "straight" : "bust"}`}>
            {lastResult.straight
              ? `STRAIGHT! +${lastResult.score} pts`
              : "BUST — no straight!"}
          </div>
          {lastResult.straight && lastResult.rollsTaken === 1 && (
            <div className="sob-bonus">Includes +100 one-roll bonus!</div>
          )}
          {lastResult.straight && lastResult.rollsTaken === 2 && (
            <div className="sob-bonus">Includes +50 two-roll bonus!</div>
          )}
        </div>
      )}

      {terminal && (
        <div className="sob-message">
          Game complete! Final score: {terminal.score}
        </div>
      )}

      {state.roundResults.length > 0 && (
        <div className="sob-history">
          {state.roundResults.map((r, i) => (
            <div key={i} className={`sob-history-row ${r.straight ? "straight" : "bust"}`}>
              <span>Round {i + 1}</span>
              <span>{r.straight ? `+${r.score} (${r.rollsTaken} roll${r.rollsTaken > 1 ? "s" : ""})` : "Bust (0)"}</span>
            </div>
          ))}
        </div>
      )}

      <div className="sob-total">Total: {state.totalScore}</div>
      <div className="sob-hint">
        Keep dice toward a straight, re-roll the rest. 1-2-3-4-5 = 150, 2-3-4-5-6 = 200. Bonus +100 in 1 roll, +50 in 2.
      </div>
    </div>
  );
}
