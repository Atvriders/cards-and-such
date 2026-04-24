import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ZooState } from "./state.js";
import { isTerminal, avgHappiness, TOTAL_TURNS } from "./state.js";
import type { ZooAction } from "./state.js";
import "./Game.css";

function HappinessBar({ value }: { value: number }): JSX.Element {
  const color = value >= 70 ? "#2a7d2e" : value >= 40 ? "#f57f17" : "#c62828";
  return (
    <div className="zoo-bar-wrap">
      <div className="zoo-bar" style={{ width: `${value}%`, background: color }} />
    </div>
  );
}

export function ZooKeeper({ state, dispatch, onGameOver }: GameProps<ZooState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const d = (a: ZooAction) => dispatch(a);
  const avg = avgHappiness(state);

  return (
    <div className="zoo-wrap">
      <div className="zoo-header">
        <span className="zoo-title">🦁 Zoo Keeper</span>
        <span className="zoo-turn">Day {state.turn}/{TOTAL_TURNS}</span>
        <span className="zoo-avg">Avg Happiness: {avg}</span>
      </div>

      {state.lastEvent && <div className="zoo-event">📢 {state.lastEvent}</div>}

      {state.phase === "action" && (
        <>
          <div className="zoo-animals">
            {state.animals.map((animal, i) => (
              <div key={animal.name} className="zoo-animal">
                <div className="zoo-animal-header">
                  <span className="zoo-animal-name">{animal.emoji} {animal.name}</span>
                  <span className="zoo-animal-happy">😊 {animal.happiness}</span>
                </div>
                <div className="zoo-meters">
                  <div className="zoo-meter-row">
                    <span>Hunger</span>
                    <HappinessBar value={animal.hunger} />
                    <span className="zoo-meter-val">{animal.hunger}</span>
                  </div>
                  <div className="zoo-meter-row">
                    <span>Dirt</span>
                    <HappinessBar value={animal.dirt} />
                    <span className="zoo-meter-val">{animal.dirt}</span>
                  </div>
                </div>
                <div className="zoo-actions">
                  <button className="zoo-btn feed" onClick={() => d({ type: "feed", animalIndex: i })}>🍖 Feed</button>
                  <button className="zoo-btn clean" onClick={() => d({ type: "clean", animalIndex: i })}>🧹 Clean</button>
                </div>
              </div>
            ))}
          </div>
          <div className="zoo-footer">
            <div className="zoo-revenue">Revenue: ${state.totalRevenue} | Visitors: {state.visitors}</div>
            <button className="zoo-visit-btn" onClick={() => d({ type: "letVisit" })}>🎟️ Open to Visitors</button>
            <button className="zoo-end-btn" onClick={() => d({ type: "endTurn" })}>
              {state.turn >= TOTAL_TURNS ? "End Final Day" : "End Day →"}
            </button>
          </div>
        </>
      )}

      {state.phase === "done" && (
        <div className="zoo-done">
          <div className="zoo-final">Final Avg Happiness: <strong>{avg}</strong></div>
          <div className="zoo-final-rev">Total Revenue: <strong>${state.totalRevenue}</strong></div>
          <div className="zoo-result">
            {avg >= 75 ? "🏆 World-Class Zoo!" : avg >= 50 ? "👍 Happy Animals!" : "😔 Need Better Care"}
          </div>
        </div>
      )}
    </div>
  );
}
