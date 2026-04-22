import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BossDiceState, BossDiceAction, BossDiceSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./BossDice.css";

const DICE_FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export function BossDice({ state, dispatch, onGameOver }: GameProps<BossDiceState, BossDiceSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const playerTotal = state.playerScores.reduce((s, n) => s + n, 0);
  const botTotal = state.botScores.reduce((s, n) => s + n, 0);
  const { current } = state;
  const crewComplete = current.has6 && current.has5 && current.has4;
  const canRoll = (state.phase === "preRoll" || state.phase === "rolling") && current.rollsUsed < 3;
  const canBank = state.phase === "rolling";

  let finalResult: "win" | "loss" | "tie" | null = null;
  if (state.gameOver) {
    finalResult = playerTotal > botTotal ? "win" : playerTotal < botTotal ? "loss" : "tie";
  }

  return (
    <div className="boss">
      <h2>Boss Dice</h2>
      <div className="boss-info">
        <span>Round: <strong>{state.round}/{state.maxRounds}</strong></span>
        <span>Roll: <strong>{current.rollsUsed}/3</strong></span>
        {crewComplete && <span>Cargo: <strong>{current.cargo}</strong></span>}
      </div>

      <div className="boss-sequence">
        <div className={`boss-seq-item ${current.has6 ? "locked" : ""}`}>6 (Ship)</div>
        <div className={`boss-seq-item ${current.has5 ? "locked" : ""}`}>5 (Captain)</div>
        <div className={`boss-seq-item ${current.has4 ? "locked" : ""}`}>4 (Crew)</div>
      </div>

      {current.rollsUsed > 0 && (
        <div className="boss-dice-row">
          {current.dice.map((d, i) => (
            <span key={i} className={`boss-die ${d.kept ? "kept" : ""}`}>
              {DICE_FACES[d.value] ?? "?"}
            </span>
          ))}
        </div>
      )}

      <div className="boss-message">{state.message}</div>

      {(state.phase === "preRoll" || state.phase === "rolling") && (
        <div className="boss-buttons">
          <button className="boss-btn" onClick={() => dispatch({ type: "roll" } as BossDiceAction)} disabled={!canRoll}>
            Roll Dice
          </button>
          <button className="boss-btn" onClick={() => dispatch({ type: "bank" } as BossDiceAction)} disabled={!canBank}>
            Bank Cargo ({current.cargo})
          </button>
        </div>
      )}

      {state.phase === "roundOver" && (
        <button className="boss-btn" onClick={() => dispatch({ type: "nextRound" } as BossDiceAction)}>
          Next Round →
        </button>
      )}

      <div className="boss-scores">
        <span>You: {state.playerScores.join(", ") || "—"} = <strong>{playerTotal}</strong></span>
        <span>Bot: {state.botScores.join(", ") || "—"} = <strong>{botTotal}</strong></span>
      </div>

      {state.gameOver && finalResult && (
        <div className={`boss-game-over ${finalResult}`}>
          {finalResult === "win" ? "You win! Higher total cargo!" : finalResult === "loss" ? "Bot wins!" : "Tie!"}
          {" "}({playerTotal} vs {botTotal})
        </div>
      )}
    </div>
  );
}
