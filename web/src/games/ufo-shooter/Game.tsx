import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { UfoShooterState, UfoShooterSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function UfoShooterGame({ state, dispatch, onGameOver }: GameProps<UfoShooterState, UfoShooterSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const isOver = state.gameOver;
  const allCleared = state.ufos.every(u => u.destroyed);
  const waveOver = allCleared || state.shotsRemaining <= 0;

  return (
    <div className="ufo-shooter">
      <div className="us-header">
        <span>Wave {Math.min(state.wave, state.totalWaves)}/{state.totalWaves}</span>
        <span>Score: {state.score}</span>
        <span>Shots: {state.shotsRemaining}</span>
      </div>

      <div className="us-sky">
        {Array.from({ length: 10 }, (_, col) => {
          const ufo = state.ufos.find(u => !u.destroyed && u.x === col);
          return (
            <div key={col} className="us-col">
              <div className="us-ufo-slot">
                {ufo ? <span title={`HP:${ufo.hp}`}>{ufo.hp > 1 ? "🛸" : "🛸"}</span> : null}
              </div>
              <div className={`us-gun-slot ${col === state.gunPosition ? "active" : ""}`}>
                {col === state.gunPosition ? "🔫" : ""}
              </div>
            </div>
          );
        })}
      </div>

      <div className="us-message">{state.message}</div>

      {!isOver && !waveOver && (
        <div className="us-controls">
          <button onClick={() => dispatch({ type: "moveLeft" })}>Left</button>
          <button onClick={() => dispatch({ type: "shoot" })}>Shoot!</button>
          <button onClick={() => dispatch({ type: "moveRight" })}>Right</button>
        </div>
      )}

      {!isOver && waveOver && (
        <div className="us-controls">
          <button className="us-nextwave" onClick={() => dispatch({ type: "nextWave" })}>
            Next Wave
          </button>
        </div>
      )}

      {isOver && (
        <div className="us-gameover">All waves complete! Score: {terminal ? terminal.score : state.score}</div>
      )}

      <button className="us-restart" onClick={() => dispatch({ type: "restart" })}>New Game</button>
    </div>
  );
}
