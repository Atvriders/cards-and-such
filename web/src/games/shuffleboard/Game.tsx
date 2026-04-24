import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ShuffleboardState, ShuffleboardAction, ShuffleboardSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function Shuffleboard({ state, dispatch, onGameOver }: GameProps<ShuffleboardState, ShuffleboardSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const pairsThisRound = Math.floor(state.discIndex / 2);
  const pairsLeft = 4 - pairsThisRound;

  return (
    <div className="sb-game">
      <div className="sb-title">Shuffleboard</div>

      <div className="sb-score-row">
        <span>You: <strong>{state.playerTotalScore}</strong></span>
        <span>Round {state.currentRound}/{state.totalRounds}</span>
        <span>Bot: <strong>{state.botTotalScore}</strong></span>
      </div>

      {/* Lane visualization */}
      <div className="sb-lane">
        <div className="sb-zone sb-zone-3">3 pts (88-100)</div>
        <div className="sb-zone sb-zone-2">2 pts (75-87)</div>
        <div className="sb-zone sb-zone-1">1 pt (60-74)</div>
        <div className="sb-zone sb-zone-0">No score</div>
        {state.currentDiscs.map((disc, i) => {
          const pct = Math.min(100, Math.max(0, disc.position));
          return (
            <div
              key={i}
              className={`sb-disc ${disc.owner} ${!disc.active ? "off" : ""}`}
              style={{ left: `${pct}%` }}
              title={`${disc.owner}: ${disc.position.toFixed(1)}`}
            />
          );
        })}
      </div>

      <div className="sb-pairs-left">{pairsLeft > 0 ? `${pairsLeft} pair(s) left this round` : "Round complete"}</div>

      {state.phase === "aim" && (
        <div className="sb-aim">
          <label>
            Angle (center=ideal): {Math.round((state.angle - 0.5) * 200)}%
            <input type="range" min={0} max={1} step={0.01} value={state.angle}
              onChange={(e) => dispatch({ type: "set-angle", value: parseFloat(e.target.value) })} />
          </label>
          <label>
            Power (75%=ideal): {Math.round(state.power * 100)}%
            <input type="range" min={0} max={1} step={0.01} value={state.power}
              onChange={(e) => dispatch({ type: "set-power", value: parseFloat(e.target.value) })} />
          </label>
          <button className="sb-btn" onClick={() => dispatch({ type: "slide" })}>Slide!</button>
        </div>
      )}

      {state.lastResult && (
        <div className="sb-result">{state.lastResult}</div>
      )}

      {state.phase === "result" && (
        <button className="sb-btn" onClick={() => dispatch({ type: "next" })}>Next Pair</button>
      )}
      {state.phase === "round-over" && (
        <button className="sb-btn" onClick={() => dispatch({ type: "next" })}>Next Round</button>
      )}

      {state.phase === "done" && (
        <div className="sb-game-over">
          Game Over!<br />
          You: {state.playerTotalScore} — Bot: {state.botTotalScore}<br />
          {state.playerTotalScore > state.botTotalScore ? "You Win!" : state.playerTotalScore < state.botTotalScore ? "Bot Wins!" : "Tie!"}
        </div>
      )}
    </div>
  );
}
