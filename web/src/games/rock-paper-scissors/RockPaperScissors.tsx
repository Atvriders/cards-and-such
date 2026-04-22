import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RPSState, RPSSettings, RPSChoice } from "./state.js";
import { reducer, isTerminal } from "./state.js";
import "./RockPaperScissors.css";

const EMOJI: Record<RPSChoice, string> = { rock: "🪨", paper: "📄", scissors: "✂️" };
const LABEL: Record<RPSChoice, string> = { rock: "Rock", paper: "Paper", scissors: "Scissors" };

export function RockPaperScissors({
  state,
  dispatch,
  onGameOver,
}: GameProps<RPSState, RPSSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const choices: RPSChoice[] = ["rock", "paper", "scissors"];

  let statusText = "Choose your weapon!";
  let statusClass = "";
  if (state.lastResult === "win") { statusText = "You win this round!"; statusClass = "win"; }
  else if (state.lastResult === "loss") { statusText = "Bot wins this round!"; statusClass = "loss"; }
  else if (state.lastResult === "draw") { statusText = "Draw!"; statusClass = "draw"; }

  if (state.gameOver) {
    if (state.winner === "player") { statusText = "🎉 You win the match!"; statusClass = "win"; }
    else if (state.winner === "bot") { statusText = "Bot wins the match!"; statusClass = "loss"; }
    else { statusText = "Match draw!"; statusClass = "draw"; }
  }

  return (
    <div className="rps">
      <div className="rps-score">
        <span className="player">You: {state.playerWins}</span>
        <span className="draws">Draws: {state.draws}</span>
        <span className="bot">Bot: {state.botWins}</span>
      </div>
      <div style={{ color: "#888", fontSize: "0.9rem" }}>
        Round {state.roundsPlayed}/{state.maxRounds} · Best of {state.maxRounds}
      </div>

      <div className={`rps-status ${statusClass}`}>{statusText}</div>

      {state.chosen && state.lastBotChoice && (
        <div className="rps-reveal">
          <span>You: {EMOJI[state.chosen]} {LABEL[state.chosen]}</span>
          <span>vs</span>
          <span>Bot: {EMOJI[state.lastBotChoice]} {LABEL[state.lastBotChoice]}</span>
        </div>
      )}

      <div className="rps-choices">
        {choices.map((c) => (
          <button
            key={c}
            className="rps-btn"
            disabled={state.gameOver}
            onClick={() => dispatch({ type: "choose", choice: c })}
            title={LABEL[c]}
          >
            {EMOJI[c]}
          </button>
        ))}
      </div>

      {state.history.length > 0 && (
        <div className="rps-history">
          {[...state.history].reverse().map((r, i) => (
            <div key={i} className={`rps-history-row ${r.result}`}>
              <span>You: {EMOJI[r.player]}</span>
              <span>Bot: {EMOJI[r.bot]}</span>
              <span>{r.result === "win" ? "Win" : r.result === "loss" ? "Loss" : "Draw"}</span>
            </div>
          ))}
        </div>
      )}

      {state.gameOver && (
        <button className="rps-restart" onClick={() => dispatch({ type: "restart" })}>
          Play Again
        </button>
      )}
    </div>
  );
}
