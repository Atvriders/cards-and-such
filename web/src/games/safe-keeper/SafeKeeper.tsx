import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SafeKeeperState, SafeKeeperAction, SafeKeeperSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./SafeKeeper.css";

const DICE_FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export function SafeKeeper({ state, dispatch, onGameOver }: GameProps<SafeKeeperState, SafeKeeperSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const names = ["You", "Bot 1", "Bot 2"];
  const isPlayerLoser = state.loser === 0;

  return (
    <div className="sk">
      <h2>Safe Keeper</h2>
      <div className="sk-info">
        <span>Safe Keeper: <span className="sk-badge">{names[state.safeKeeper] ?? "?"}</span></span>
        <span>Active: <strong>{names[state.activePlayer] ?? "?"}</strong></span>
        <span>Marks to Lose: <strong>{state.marksToLose}</strong></span>
      </div>

      <div className="sk-marks">
        {(["You", "Bot 1", "Bot 2"] as const).map((name, i) => (
          <span key={i}>
            {name}: <strong>{state.marks[i] ?? 0}</strong> mark{state.marks[i] !== 1 ? "s" : ""}
            {state.safeKeeper === i ? " 🎯" : ""}
          </span>
        ))}
      </div>

      {state.lastRoll && (
        <div className="sk-dice">
          <span>{DICE_FACES[state.lastRoll[0]] ?? "?"}</span>
          <span>{DICE_FACES[state.lastRoll[1]] ?? "?"}</span>
        </div>
      )}

      {state.lastEvents.length > 0 && (
        <div className="sk-events">
          <ul>
            {state.lastEvents.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      <div className="sk-message">{state.message}</div>

      {state.phase === "rolling" && (
        <button data-testid="hint-target-safe-keeper-roll" className="sk-btn" onClick={() => dispatch({ type: "roll" } as SafeKeeperAction)}>
          {state.activePlayer === 0 ? "Roll Dice" : `Roll for ${names[state.activePlayer] ?? "Bot"}...`}
        </button>
      )}

      {state.gameOver && (
        <div className={`sk-game-over ${isPlayerLoser ? "loss" : "win"}`}>
          {isPlayerLoser ? "You got too many marks — you lose!" : `${names[state.loser ?? 0] ?? "Someone"} loses — you survive!`}
        </div>
      )}
    </div>
  );
}
