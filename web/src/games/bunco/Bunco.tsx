import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BuncoState, BuncoAction, BuncoSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { Die } from "../../engines/dice/Die.js";
import "./Bunco.css";

export function Bunco({ state, dispatch, onGameOver }: GameProps<BuncoState, BuncoSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const canRoll = state.phase === "preRoll" || state.phase === "rolled";
  const isBunco = state.lastRollScore === 21;

  return (
    <div className="bunco">
      <div className="bunco-info">
        <span>Round {state.round} / 6</span>
        <span className="bunco-target">Target: roll {state.round}s</span>
        <span>Round Score: {state.roundScore}</span>
        <span>Total: {state.totalScore}</span>
      </div>

      <div className="bunco-dice">
        {state.dice.map((die, i) => (
          <Die key={i} value={die.value} kept={false} onClick={() => {}} />
        ))}
      </div>

      {isBunco && <div className="bunco-bunco">BUNCO! +21</div>}
      {state.lastRollScore > 0 && !isBunco && (
        <div className="bunco-last-roll">+{state.lastRollScore}</div>
      )}
      {state.phase === "rolled" && state.lastRollScore === 0 && (
        <div className="bunco-last-roll">No score — round over</div>
      )}

      <div className="bunco-controls">
        <button data-testid="hint-target-bunco-roll" onClick={() => dispatch({ type: "roll" } as BuncoAction)} disabled={!canRoll || !!terminal}>
          Roll
        </button>
        {state.phase === "roundOver" && !terminal && (
          <button data-testid="hint-target-bunco-next-round" onClick={() => dispatch({ type: "nextRound" } as BuncoAction)}>Next Round</button>
        )}
      </div>

      {terminal && <div className="bunco-game-over">Game Over! Total Score: {terminal.score}</div>}

      <table className="bunco-round-scores">
        <thead><tr><th>Round</th><th>Target</th><th>Score</th></tr></thead>
        <tbody>
          {Array.from({ length: 6 }, (_, i) => {
            const roundNum = i + 1;
            const scored = state.roundScores[i];
            const isActive = roundNum === state.round && state.phase !== "gameOver";
            return (
              <tr key={roundNum} className={isActive ? "active" : ""}>
                <td>{roundNum}</td>
                <td>Roll {roundNum}s</td>
                <td>{scored !== undefined ? scored : isActive ? state.roundScore + " (active)" : "—"}</td>
              </tr>
            );
          })}
          <tr className="total">
            <td colSpan={2}>Total</td>
            <td>{state.totalScore}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
