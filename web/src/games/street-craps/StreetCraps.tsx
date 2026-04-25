import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { StreetCrapsState, StreetCrapsSettings, StreetCrapsAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./StreetCraps.css";

const FACE = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export function StreetCraps({
  state,
  dispatch,
  onGameOver,
}: GameProps<StreetCrapsState, StreetCrapsSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { phase, lastRoll, lastSum, point, roundResult, roundsPlayed, totalRounds, wins, rollHistory } = state;
  const canRoll = phase === "comeOut" || phase === "point";

  return (
    <div className="sc">
      <div className="sc-header">
        Street Craps — Round {roundsPlayed + (canRoll ? 1 : 0)} / {totalRounds} | Wins: {wins}
      </div>

      {phase === "comeOut" && <div style={{ color: "#888" }}>Come-out roll — 7 or 11 wins, 2/3/12 loses</div>}

      {point !== null && (
        <div className="sc-point-banner">Point: {point}</div>
      )}

      {lastRoll.length > 0 && (
        <>
          <div className="sc-dice">
            {lastRoll.map((v, i) => <div key={i} className="sc-die">{FACE[v]}</div>)}
          </div>
          <div className="sc-sum">{lastSum}</div>
        </>
      )}

      {(phase === "roundDone" || phase === "gameDone") && roundResult !== "pending" && (
        <div className={`sc-result ${roundResult}`}>
          {roundResult === "win" ? "Winner!" : "Craps — You Lose!"}
        </div>
      )}

      {rollHistory.length > 1 && phase === "point" && (
        <div className="sc-history">Roll history: {rollHistory.join(", ")}</div>
      )}

      {terminal && (
        <div className="sc-score">Game over! {wins} / {totalRounds} wins.</div>
      )}

      <div className="sc-controls">
        {canRoll && (
          <button onClick={() => dispatch({ type: "roll" } as StreetCrapsAction)}>
            {phase === "comeOut" ? "Come-Out Roll" : `Roll for Point (${point})`}
          </button>
        )}
        {phase === "roundDone" && (
          <button className="next-btn" onClick={() => dispatch({ type: "nextRound" } as StreetCrapsAction)}>
            Next Round
          </button>
        )}
      </div>
    </div>
  );
}
