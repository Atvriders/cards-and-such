import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ShipCaptainCrewState, SCCAction, ShipCaptainCrewSettings } from "./state.js";
import { isTerminal, totalScore } from "./state.js";
import { Die } from "../../engines/dice/Die.js";
import "./ShipCaptainCrew.css";

export function ShipCaptainCrew({ state, dispatch, onGameOver }: GameProps<ShipCaptainCrewState, ShipCaptainCrewSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const canRoll = (state.phase === "preRoll" || state.phase === "rolling") && state.current.rollsUsed < 3;
  const canBank = state.phase === "rolling";

  const cur = state.current;
  const playerTotal = totalScore(state.playerScores);
  const botTotal = totalScore(state.botScores);

  return (
    <div className="scc scc-theme">
      <div className="scc-info">
        <span>Round {Math.min(state.round, state.maxRounds)} / {state.maxRounds}</span>
        <span>Roll {cur.rollsUsed} / 3</span>
      </div>

      <div className="scc-sequence">
        <span className={cur.hasShip ? "locked" : "pending"}>Ship (6)</span>
        <span>&rarr;</span>
        <span className={cur.hasCaptain ? "locked" : "pending"}>Captain (5)</span>
        <span>&rarr;</span>
        <span className={cur.hasCrew ? "locked" : "pending"}>Crew (4)</span>
      </div>

      <div className="scc-dice">
        {cur.dice.map((die, i) => (
          <Die key={i} value={die.value} kept={die.kept} onClick={() => {}} />
        ))}
      </div>

      {cur.hasShip && cur.hasCaptain && cur.hasCrew && (
        <div className="scc-cargo">Cargo: <strong>{cur.cargoScore}</strong></div>
      )}

      <div className="scc-controls">
        <button onClick={() => dispatch({ type: "roll" } as SCCAction)} disabled={!canRoll || !!terminal}>
          {cur.rollsUsed === 0 ? "Roll" : "Re-roll"}
        </button>
        <button onClick={() => dispatch({ type: "bank" } as SCCAction)} disabled={!canBank || !!terminal}>
          Bank &amp; Pass
        </button>
        {state.phase === "roundOver" && !state.gameOver && (
          <button onClick={() => dispatch({ type: "nextRound" } as SCCAction)}>Next Round</button>
        )}
      </div>

      {state.roundResult && (
        <div className="scc-round-result">
          <div>You scored: <strong>{state.roundResult.player}</strong></div>
          <div>Bot scored: <strong>{state.roundResult.bot}</strong></div>
        </div>
      )}

      <table className="scc-scoreboard">
        <thead>
          <tr><th>Round</th><th>You</th><th>Bot</th></tr>
        </thead>
        <tbody>
          {state.playerScores.map((ps, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{ps}</td>
              <td>{state.botScores[i]}</td>
            </tr>
          ))}
          <tr className="total">
            <td>Total</td>
            <td>{playerTotal}</td>
            <td>{botTotal}</td>
          </tr>
        </tbody>
      </table>

      {terminal && (
        <div className="scc-game-over">
          Game Over! You: {playerTotal} | Bot: {botTotal}
          {playerTotal >= botTotal ? " — You Win!" : " — Bot Wins!"}
        </div>
      )}
    </div>
  );
}
