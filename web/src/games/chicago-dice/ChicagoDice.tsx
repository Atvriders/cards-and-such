import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ChicagoState, ChicagoAction, ChicagoSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./ChicagoDice.css";

export function ChicagoDice({
  state,
  dispatch,
  onGameOver,
}: GameProps<ChicagoState, ChicagoSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const currentRound = state.rounds[state.roundIndex];
  const target = currentRound?.target ?? 12;

  function handleRoll() {
    dispatch({ type: "roll" } as ChicagoAction);
  }

  return (
    <div className="chicago">
      <div className="chicago-header">
        <h2>Chicago Dice</h2>
        <div className="chicago-totals">
          <span>You: <strong>{state.playerTotal}</strong></span>
          <span>Bot: <strong>{state.botTotal}</strong></span>
        </div>
      </div>

      {state.phase !== "gameOver" && (
        <div className="chicago-target">
          Round {state.roundIndex + 1} / 11 — Target: <strong>{target}</strong>
        </div>
      )}

      <div className="chicago-message">{state.message}</div>

      {state.phase === "roll" && (
        <button data-testid="hint-target-chicago-dice-roll" className="chicago-btn" onClick={handleRoll}>Roll Dice</button>
      )}

      {state.phase === "result" && (
        <button data-testid="hint-target-chicago-dice-roll" className="chicago-btn" onClick={handleRoll}>Next Round →</button>
      )}

      {state.winner && (
        <div className={`chicago-game-over ${state.winner === "player" ? "win" : state.winner === "tie" ? "tie" : "loss"}`}>
          {state.winner === "player" ? "You win!" : state.winner === "tie" ? "It's a tie!" : "Bot wins!"}
        </div>
      )}

      <table className="chicago-table">
        <thead>
          <tr>
            <th>Rd</th>
            <th>Target</th>
            <th>Your Roll</th>
            <th>Bot Roll</th>
            <th>You</th>
            <th>Bot</th>
          </tr>
        </thead>
        <tbody>
          {state.rounds.map((r, i) => (
            <tr key={i} className={i === state.roundIndex && state.phase === "roll" ? "active" : ""}>
              <td>{i + 1}</td>
              <td>{r.target}</td>
              <td>{r.playerRoll ? `${r.playerRoll[0]}+${r.playerRoll[1]}` : "—"}</td>
              <td>{r.botRoll ? `${r.botRoll[0]}+${r.botRoll[1]}` : "—"}</td>
              <td className={r.playerScored ? "scored" : ""}>{r.playerScored ? `+${r.target}` : r.playerRoll ? "0" : "—"}</td>
              <td className={r.botScored ? "scored" : ""}>{r.botScored ? `+${r.target}` : r.botRoll ? "0" : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
