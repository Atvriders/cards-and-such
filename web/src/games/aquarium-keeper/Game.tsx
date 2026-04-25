import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AquariumState, AquariumAction, FishSpecies } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const SPECIES_EMOJI: Record<FishSpecies, string> = {
  clownfish: "🐠", guppy: "🐟", angelfish: "🐡", tetra: "🐟", betta: "🐠",
};

function MeterBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="aqk-meter-bar">
      <div className="aqk-meter-fill" style={{ width: `${value}%`, background: color }} />
    </div>
  );
}

export function AquariumKeeper({
  state,
  dispatch,
  onGameOver,
}: GameProps<AquariumState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const d = (a: AquariumAction) => dispatch(a);
  const waterColor = state.water >= 60 ? "#29b6f6" : state.water >= 30 ? "#ffa726" : "#ef5350";
  const foodColor = state.food >= 50 ? "#66bb6a" : state.food >= 20 ? "#ffa726" : "#ef5350";

  return (
    <div className="aqk-wrap">
      <div className="aqk-header">
        <span className="aqk-title">Aquarium Keeper</span>
        <span className="aqk-day">Day {state.day}/{state.totalDays}</span>
        <span className="aqk-score">Score: {state.score}</span>
      </div>

      <div className="aqk-meters">
        <div className="aqk-meter-row">
          <span className="aqk-meter-label">Water</span>
          <MeterBar value={state.water} color={waterColor} />
          <span className="aqk-meter-val">{Math.round(state.water)}%</span>
        </div>
        <div className="aqk-meter-row">
          <span className="aqk-meter-label">Food</span>
          <MeterBar value={state.food} color={foodColor} />
          <span className="aqk-meter-val">{Math.round(state.food)}%</span>
        </div>
      </div>

      <div className="aqk-temp">Temperature: {state.temperature}°C (ideal: 24–26°C)</div>

      <div className="aqk-tank">
        {state.fish.map(f => (
          <div key={f.species} className="aqk-fish-row">
            <div className="aqk-fish-info">
              <span>{SPECIES_EMOJI[f.species]}</span>
              <span>{f.species} ×{f.count}</span>
            </div>
            <span className="aqk-fish-health">Health: {Math.round(f.health)}%</span>
          </div>
        ))}
      </div>

      {state.events.length > 0 && (
        <div className="aqk-events">{state.events.join(" | ")}</div>
      )}

      {state.phase === "playing" && (
        <div className="aqk-controls">
          <button className="aqk-btn water" onClick={() => d({ type: "cleanWater" })}>Clean Water</button>
          <button className="aqk-btn food" onClick={() => d({ type: "addFood", amount: 20 })}>Feed Fish</button>
          <button className="aqk-btn temp-up" onClick={() => d({ type: "adjustTemp", delta: 1 })}>Temp +1°</button>
          <button className="aqk-btn temp-down" onClick={() => d({ type: "adjustTemp", delta: -1 })}>Temp −1°</button>
          <button className="aqk-btn next" onClick={() => d({ type: "nextDay" })}>Next Day →</button>
        </div>
      )}

      {state.phase === "done" && (
        <div className="aqk-done">
          <div>Final Score: {state.score}</div>
          <div>{state.score >= 200 ? "Master Aquarist!" : state.score >= 100 ? "Good keeper!" : "Keep practicing!"}</div>
        </div>
      )}
    </div>
  );
}
