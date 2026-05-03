import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WalkingTheDogState, WalkingTheDogSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const HAZARD_EMOJI: Record<string, string> = {
  puddle: "💧",
  bike: "🚲",
  cat: "🐱",
};

export function WalkingTheDogGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<WalkingTheDogState, WalkingTheDogSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const hazardLabel = state.hazardAhead ? `${HAZARD_EMOJI[state.hazardAhead]} ${state.hazardAhead}` : "🦴 clear path";

  return (
    <div className="wtd-game">
      <div className="wtd-title">Walking the Dog 🐕</div>

      <div className="wtd-hud">
        <span>Step {state.step}/{state.totalSteps}</span>
        <span>Treats: {state.treats} 🦴</span>
        <span>Energy: {state.energy}%</span>
      </div>

      <div className="wtd-energy-bar">
        <div className="wtd-energy-fill" style={{ width: `${state.energy}%` }} />
      </div>

      <div className="wtd-scene">
        <div className="wtd-path">
          <span className="wtd-dog">🐕</span>
          <span className="wtd-ahead">{hazardLabel}</span>
        </div>
      </div>

      {state.lastResult && (
        <div className={`wtd-feedback ${state.lastResult}`}>
          {state.lastResult === "good" ? "Nice!" : state.lastResult === "bad" ? "Oof!" : "OK"}
          {state.lastAction === "walk" && state.hazardAhead === null && " +treat"}
        </div>
      )}

      {!state.gameOver && (
        <div className="wtd-actions">
          <button data-testid="hint-target-walking-the-dog-action" onClick={() => dispatch({ type: "walk" })}>🐾 Walk</button>
          <button onClick={() => dispatch({ type: "dodge" })}>💨 Dodge</button>
          <button onClick={() => dispatch({ type: "sniff" })}>👃 Sniff</button>
        </div>
      )}

      <div className="wtd-hint">
        {state.hazardAhead ? "Hazard ahead — dodge or walk through" : "Clear — walk or sniff for treats"}
      </div>

      {state.gameOver && (
        <div className="wtd-result">
          {state.won ? "Great walk! 🎉" : "Dog ran out of energy! 😴"}<br />
          <span>Treats: {state.treats} | Score: {terminal?.score}</span>
        </div>
      )}
    </div>
  );
}
