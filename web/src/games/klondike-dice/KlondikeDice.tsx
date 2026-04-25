import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KlondikeDiceState, KlondikeDiceSettings, KlondikeDiceAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./KlondikeDice.css";

const DIE_FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export function KlondikeDice({
  state,
  dispatch,
  onGameOver,
}: GameProps<KlondikeDiceState, KlondikeDiceSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const target = parseInt(state.settings.target, 10) * 10;
  const { phase, lastRoll, score, turnScore, turnsPlayed } = state;

  return (
    <div className="klondike-dice">
      <div className="klondike-dice-scoreboard">
        <span>Score: {score} / {target}</span>
        <span style={{ color: "#2a6a2a" }}>This Turn: {turnScore}</span>
        <span style={{ color: "#666" }}>Turns: {turnsPlayed}</span>
      </div>

      {lastRoll > 0 && (
        <div className="klondike-dice-die">{DIE_FACES[lastRoll]}</div>
      )}

      {phase === "bust" && (
        <div className="klondike-dice-message">Bust! Rolled a 1 — turn score lost!</div>
      )}

      {terminal && (
        <div className="klondike-dice-message won">
          You reached {target}! Score: {terminal.score}
        </div>
      )}

      <div className="klondike-dice-controls">
        {phase === "preRoll" && !terminal && (
          <button onClick={() => dispatch({ type: "roll" } as KlondikeDiceAction)}>Roll</button>
        )}
        {phase === "rolled" && (
          <>
            <button onClick={() => dispatch({ type: "roll" } as KlondikeDiceAction)}>Push Luck</button>
            <button className="bank-btn" onClick={() => dispatch({ type: "bank" } as KlondikeDiceAction)}>
              Bank {turnScore}
            </button>
          </>
        )}
        {phase === "bust" && (
          <button onClick={() => dispatch({ type: "nextTurn" } as KlondikeDiceAction)}>Next Turn</button>
        )}
      </div>

      <div className="klondike-dice-history">
        Pile this turn: {state.pile} | Total: {score}
      </div>
    </div>
  );
}
