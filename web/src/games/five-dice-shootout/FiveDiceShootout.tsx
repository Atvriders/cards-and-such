import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FiveDiceState, FiveDiceAction, FiveDiceSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./FiveDiceShootout.css";

const DICE_FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export function FiveDiceShootout({ state, dispatch, onGameOver }: GameProps<FiveDiceState, FiveDiceSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const lastRound = state.rounds[state.rounds.length - 1];

  return (
    <div className="fds">
      <h2>Five Dice Shootout</h2>
      <div className="fds-info">
        <span>Round: <strong>{state.round}/{state.maxRounds}</strong></span>
        <span>Wins — You: <strong>{state.playerWins}</strong>, Bot: <strong>{state.botWins}</strong>{state.ties > 0 ? `, Ties: ${state.ties}` : ""}</span>
      </div>

      <div className="fds-message">{state.message}</div>

      {lastRound && (
        <div className="fds-rolls">
          <div className="fds-player-roll">
            <h4>You</h4>
            <div className="fds-dice">{lastRound.playerDice.map((d, i) => <span key={i}>{DICE_FACES[d] ?? "?"}</span>)}</div>
            <div className="fds-sum">{lastRound.playerSum}</div>
          </div>
          <div className="fds-bot-roll">
            <h4>Bot</h4>
            <div className="fds-dice">{lastRound.botDice.map((d, i) => <span key={i}>{DICE_FACES[d] ?? "?"}</span>)}</div>
            <div className="fds-sum">{lastRound.botSum}</div>
          </div>
        </div>
      )}

      {state.phase === "rolling" && (
        <button className="fds-btn" onClick={() => dispatch({ type: "roll" } as FiveDiceAction)}>
          Roll 5 Dice!
        </button>
      )}

      {state.phase === "roundOver" && (
        <button className="fds-btn" onClick={() => dispatch({ type: "nextRound" } as FiveDiceAction)}>
          Next Round →
        </button>
      )}

      {state.rounds.length > 0 && (
        <table className="fds-table">
          <thead>
            <tr><th>Rd</th><th>Your Sum</th><th>Bot Sum</th><th>Result</th></tr>
          </thead>
          <tbody>
            {state.rounds.map((r, i) => (
              <tr key={i} className={r.winner === "player" ? "win-row" : r.winner === "bot" ? "loss-row" : ""}>
                <td>{i + 1}</td>
                <td>{r.playerSum}</td>
                <td>{r.botSum}</td>
                <td>{r.winner === "player" ? "Win" : r.winner === "bot" ? "Loss" : "Tie"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {state.gameOver && state.finalWinner && (
        <div className={`fds-game-over ${state.finalWinner}`}>
          {state.finalWinner === "player" ? "You win the Shootout!" : state.finalWinner === "bot" ? "Bot wins!" : "It's a tie!"}
          {" "}({state.playerWins}–{state.botWins})
        </div>
      )}
    </div>
  );
}
