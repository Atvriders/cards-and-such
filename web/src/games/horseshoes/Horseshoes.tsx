import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HorseshoesState, HorseshoesAction, HorseshoesSettings, TossResult } from "./state.js";
import { isTerminal } from "./state.js";
import "./Horseshoes.css";

function resultClass(r: TossResult): string {
  return r;
}

function resultLabel(r: TossResult): string {
  return r.charAt(0).toUpperCase() + r.slice(1);
}

export function Horseshoes({
  state,
  dispatch,
  onGameOver,
}: GameProps<HorseshoesState, HorseshoesSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const gameOver = terminal !== null;

  return (
    <div className="horseshoes-game">
      <div className="horseshoes-title">Horseshoes</div>

      <div className="horseshoes-score">
        <span className="player">You: {state.playerScore}</span>
        <span className="bot">Bot: {state.botScore}</span>
      </div>
      <div className="horseshoes-target">First to {state.targetScore} wins — Turn {state.turn}</div>

      {/* Controls */}
      {!gameOver && (
        <div className="horseshoes-controls">
          <div className="horseshoes-control-row">
            <div className="horseshoes-control-label">Power: {Math.round(state.power * 100)}%</div>
            <input
              type="range"
              className="horseshoes-slider"
              min={0} max={1} step={0.01}
              value={state.power}
              onChange={(e) => dispatch({ type: "set-power", power: parseFloat(e.target.value) })}
            />
          </div>
          <div className="horseshoes-control-row">
            <div className="horseshoes-control-label">
              Aim: {Math.round((state.aim - 0.5) * 200)}% {state.aim > 0.5 ? "right" : state.aim < 0.5 ? "left" : "center"}
            </div>
            <input
              type="range"
              className="horseshoes-slider"
              min={0} max={1} step={0.01}
              value={state.aim}
              onChange={(e) => dispatch({ type: "set-aim", aim: parseFloat(e.target.value) })}
            />
          </div>
          <button data-testid="hint-target-horseshoes-action" className="horseshoes-toss-button" onClick={() => dispatch({ type: "toss" })}>
            Toss!
          </button>
        </div>
      )}

      {/* Last turn result */}
      {state.lastTurn && (
        <div className="horseshoes-result">
          <div className="horseshoes-result-title">Last Turn</div>
          <div className="horseshoes-toss-row">
            <span className="horseshoes-result-label">Your toss 1:</span>
            <span className={resultClass(state.lastTurn.player[0].result)}>
              {resultLabel(state.lastTurn.player[0].result)} (+{state.lastTurn.player[0].points})
            </span>
          </div>
          <div className="horseshoes-toss-row">
            <span className="horseshoes-result-label">Your toss 2:</span>
            <span className={resultClass(state.lastTurn.player[1].result)}>
              {resultLabel(state.lastTurn.player[1].result)} (+{state.lastTurn.player[1].points})
            </span>
          </div>
          <div className="horseshoes-toss-row">
            <span className="horseshoes-result-label">Bot toss 1:</span>
            <span className={resultClass(state.lastTurn.bot[0].result)}>
              {resultLabel(state.lastTurn.bot[0].result)} (+{state.lastTurn.bot[0].points})
            </span>
          </div>
          <div className="horseshoes-toss-row">
            <span className="horseshoes-result-label">Bot toss 2:</span>
            <span className={resultClass(state.lastTurn.bot[1].result)}>
              {resultLabel(state.lastTurn.bot[1].result)} (+{state.lastTurn.bot[1].points})
            </span>
          </div>
          <div className="horseshoes-net">
            You scored: +{state.lastTurn.playerNet} | Bot scored: +{state.lastTurn.botNet}
          </div>
        </div>
      )}

      {gameOver && (
        <div className="horseshoes-game-over">
          {state.winner === "player" ? "You win!" : "Bot wins!"}
          <br />
          <span style={{ fontSize: "0.9rem", opacity: 0.75 }}>
            {state.playerScore} — {state.botScore}
          </span>
        </div>
      )}
    </div>
  );
}
