import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MexicoState, MexicoAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./MexicoDice.css";

type MexicoSettings = MexicoState["settings"];

function dieFace(val: number): string {
  return ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][val] ?? "?";
}

function diceLabel(d1: number, d2: number): string {
  if (d1 === 0) return "—";
  const hi = Math.max(d1, d2);
  const lo = Math.min(d1, d2);
  if (hi === 2 && lo === 1) return "MEXICO!";
  if (hi === lo) return `Doubles ${hi}`;
  return `${hi}-${lo}`;
}

export function MexicoDice({
  state,
  dispatch,
  onGameOver,
}: GameProps<MexicoState, MexicoSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { playerLives, botLives, dice, botDice, rerolls, phase, roundResult, roundNum } = state;

  const canRoll = phase === "playerRolling" && rerolls < 3;
  const canKeep = phase === "playerRolling" && rerolls > 0;

  return (
    <div className="mexico">
      <div className="mexico-header">
        <span className="mexico-lives player">You: {"❤️".repeat(playerLives)}{"🖤".repeat(Number(state.settings.lives) - playerLives)}</span>
        <span className="mexico-round">Round {roundNum}</span>
        <span className="mexico-lives bot">Bot: {"❤️".repeat(botLives)}{"🖤".repeat(Number(state.settings.lives) - botLives)}</span>
      </div>

      <div className="mexico-section">
        <div className="mexico-label">Your roll ({rerolls}/3)</div>
        <div className="mexico-dice">
          <span className="mexico-die">{dieFace(dice[0])}</span>
          <span className="mexico-die">{dieFace(dice[1])}</span>
        </div>
        {rerolls > 0 && <div className="mexico-hand-label">{diceLabel(dice[0], dice[1])}</div>}
      </div>

      {phase !== "playerRolling" && botDice[0] > 0 && (
        <div className="mexico-section">
          <div className="mexico-label">Bot's roll</div>
          <div className="mexico-dice">
            <span className="mexico-die">{dieFace(botDice[0])}</span>
            <span className="mexico-die">{dieFace(botDice[1])}</span>
          </div>
          <div className="mexico-hand-label">{diceLabel(botDice[0], botDice[1])}</div>
        </div>
      )}

      {roundResult && (
        <div className={`mexico-result ${roundResult.includes("You win") ? "win" : roundResult.includes("Tie") ? "tie" : "lose"}`}>
          {roundResult}
        </div>
      )}

      {phase === "gameOver" ? (
        <div className={`mexico-gameover ${playerLives > 0 ? "win" : "lose"}`}>
          {playerLives > 0 ? `You win! Bot ran out of lives.` : `Bot wins! You ran out of lives.`}
        </div>
      ) : (
        <div className="mexico-controls">
          {canRoll && (
            <button data-testid="hint-target-mexico-dice-roll" onClick={() => dispatch({ type: "roll" } as MexicoAction)}>
              Roll {rerolls === 0 ? "" : "Again"}
            </button>
          )}
          {canKeep && (
            <button className="keep-btn" data-testid="hint-target-mexico-dice-keep" onClick={() => dispatch({ type: "keep" } as MexicoAction)}>
              Keep
            </button>
          )}
          {(phase === "botRolling" || phase === "roundOver") && (
            <button data-testid="hint-target-mexico-dice-next" onClick={() => dispatch({ type: "nextRound" } as MexicoAction)}>
              {phase === "botRolling" ? "Reveal Bot" : "Next Round"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
