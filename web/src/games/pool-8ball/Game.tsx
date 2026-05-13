import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Pool8BallState, Pool8BallAction, Pool8BallSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function Pool8Ball({ state, dispatch, onGameOver }: GameProps<Pool8BallState, Pool8BallSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const [angle, setAngle] = useState(0.5);
  const [power, setPower] = useState(0.6);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const availableBalls = state.balls.filter((b) => !b.pocketed && b.id !== 8);
  const eightBallPocketed = state.balls.find((b) => b.id === 8)?.pocketed ?? false;

  const playerBalls = state.balls.filter(
    (b) =>
      (state.playerGroup === "solids" && b.id >= 1 && b.id <= 7) ||
      (state.playerGroup === "stripes" && b.id >= 9 && b.id <= 15)
  );
  const playerBallsLeft = playerBalls.filter((b) => !b.pocketed).length;

  const canPick8 = state.playerGroup !== "unassigned" && playerBallsLeft === 0;

  const pickable = state.balls.filter((b) => {
    if (b.pocketed) return false;
    if (b.id === 8) return canPick8;
    if (state.playerGroup === "unassigned") return true;
    if (state.playerGroup === "solids") return b.id >= 1 && b.id <= 7;
    return b.id >= 9 && b.id <= 15;
  });

  return (
    <div className="pool-game fade-in">
      <div className="pool-title">Pool — 8 Ball</div>

      <div className="pool-info-row">
        <span>You: <strong>{state.playerGroup === "unassigned" ? "?" : state.playerGroup}</strong></span>
        <span>Turn #{state.turnCount + 1}</span>
        <span>Bot: <strong>{state.botGroup === "unassigned" ? "?" : state.botGroup}</strong></span>
      </div>

      {/* Ball tray */}
      <div className="pool-ball-tray">
        {state.balls.map((b) => {
          const isStripe = b.id >= 9;
          const isEight = b.id === 8;
          const isSelected = state.targetBall === b.id;
          const pickableNow = pickable.some((p) => p.id === b.id);
          return (
            <button
              key={b.id}
              className={`pool-ball ${b.pocketed ? "pocketed" : ""} ${isStripe ? "stripe" : isEight ? "eight" : "solid"} ${isSelected ? "selected" : ""}`}
              disabled={b.pocketed || state.phase !== "pick" || state.currentTurn !== "player" || !pickableNow}
              onClick={() => dispatch({ type: "pick-ball", ballId: b.id })}
              title={`Ball ${b.id}${b.pocketed ? " (pocketed)" : ""}`}
            >
              {b.pocketed ? "○" : b.id}
            </button>
          );
        })}
      </div>

      {state.phase === "pick" && state.currentTurn === "player" && !eightBallPocketed && (
        <div className="pool-prompt">Pick a ball to target{canPick8 ? " (or the 8-ball to win!)" : ""}</div>
      )}

      {state.phase === "aim" && (
        <div className="pool-aim-section">
          <div className="pool-aim-label">Targeting ball {state.targetBall}</div>
          <label>
            Angle: {Math.round(angle * 100)}%
            <input type="range" min={0} max={1} step={0.01} value={angle}
              onChange={(e) => { const v = parseFloat(e.target.value); setAngle(v); dispatch({ type: "set-angle", value: v }); }} />
          </label>
          <label>
            Power: {Math.round(power * 100)}%
            <input type="range" min={0} max={1} step={0.01} value={power}
              onChange={(e) => { const v = parseFloat(e.target.value); setPower(v); dispatch({ type: "set-power", value: v }); }} />
          </label>
          <button className="pool-btn" onClick={() => dispatch({ type: "shoot" })}>Shoot!</button>
        </div>
      )}

      {state.lastResult && (
        <div className="pool-result">{state.lastResult}</div>
      )}

      {state.phase === "result" && !state.winner && (
        <button className="pool-btn" onClick={() => dispatch({ type: "next-turn" })}>
          {state.currentTurn === "player" ? "Continue Turn" : "Bot Takes Turn"}
        </button>
      )}

      {state.winner && (
        <div className="pool-game-over">
          {state.winner === "player" ? "You Win!" : "Bot Wins!"}<br />
          {state.lastResult}
        </div>
      )}
    </div>
  );
}
