import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FourFiveSixState, FourFiveSixSettings, FourFiveSixAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./FourFiveSix.css";

const FACE = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export function FourFiveSix({
  state,
  dispatch,
  onGameOver,
}: GameProps<FourFiveSixState, FourFiveSixSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { phase, playerDice, dealerDice, playerPoint, dealerPoint, playerSpecial, dealerSpecial, roundResult, roundsPlayed, totalRounds, wins } = state;

  return (
    <div className="ffs">
      <div className="ffs-header">
        Four-Five-Six — Round {roundsPlayed} / {totalRounds} | Wins: {wins}
      </div>

      <div className="ffs-section">
        <div className="ffs-label">Your Roll:</div>
        {playerDice.length > 0 && (
          <div className="ffs-dice">
            {playerDice.map((v, i) => <div key={i} className="ffs-die">{FACE[v]}</div>)}
          </div>
        )}
        {playerSpecial && <div style={{ fontWeight: "bold" }}>{playerSpecial === "win" ? "4-5-6 / Triple — Instant Win!" : "1-2-3 / Triple 1s — Instant Lose!"}</div>}
        {playerPoint !== null && <div>Your Point: <strong>{playerPoint}</strong></div>}
      </div>

      {(dealerDice.length > 0) && (
        <div className="ffs-section">
          <div className="ffs-label">Dealer Roll:</div>
          <div className="ffs-dice">
            {dealerDice.map((v, i) => <div key={i} className="ffs-die">{FACE[v]}</div>)}
          </div>
          {dealerSpecial && <div style={{ fontWeight: "bold" }}>{dealerSpecial === "win" ? "Dealer 4-5-6!" : "Dealer 1-2-3!"}</div>}
          {dealerPoint !== null && <div>Dealer Point: <strong>{dealerPoint}</strong></div>}
        </div>
      )}

      {(phase === "roundDone" || phase === "gameDone") && roundResult !== "pending" && (
        <div className={`ffs-result ${roundResult}`}>
          {roundResult === "win" ? "You Win!" : roundResult === "lose" ? "You Lose!" : "Push!"}
        </div>
      )}

      {terminal && (
        <div className="ffs-score">Game over! {wins} / {totalRounds} rounds won.</div>
      )}

      <div className="ffs-controls">
        {phase === "preRoll" && (
          <button className="primary" onClick={() => dispatch({ type: "roll" } as FourFiveSixAction)}>Roll</button>
        )}
        {phase === "dealerRolling" && (
          <button className="primary" onClick={() => dispatch({ type: "rollDealer" } as FourFiveSixAction)}>Dealer Rolls</button>
        )}
        {phase === "roundDone" && (
          <button onClick={() => dispatch({ type: "nextRound" } as FourFiveSixAction)}>Next Round</button>
        )}
      </div>
    </div>
  );
}
