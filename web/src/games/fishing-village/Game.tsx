import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FishingVillageState, FishingVillageAction, DayAction } from "./state.js";
import { isTerminal, FISH_PRICES, TOTAL_DAYS } from "./state.js";
import "./Game.css";

const WEATHER_EMOJI: Record<string, string> = { sunny: "☀️", cloudy: "⛅", stormy: "⛈️" };
const FISH_EMOJI: Record<string, string> = { cod: "🐟", tuna: "🐠", herring: "🐡", salmon: "🍣", bass: "🐟" };

const ACTIONS: { action: DayAction; label: string; desc: string; energyCost: number }[] = [
  { action: "fish_shore", label: "🎣 Shore Fish", desc: "Catch cod/herring/bass. Cost: 1 energy", energyCost: 1 },
  { action: "fish_deep", label: "⚓ Deep Fish",  desc: "Catch tuna/salmon. Cost: 2 energy, 1 durability", energyCost: 2 },
  { action: "rest",       label: "😴 Rest",       desc: "+3 energy. No fish.", energyCost: 0 },
  { action: "trade",      label: "💰 Sell Fish",  desc: "Sell all fish at market prices.", energyCost: 0 },
  { action: "repair",     label: "🔧 Repair Boat", desc: "Restore boat durability (5c per point).", energyCost: 0 },
];

export function FishingVillage({ state, dispatch, onGameOver }: GameProps<FishingVillageState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const d = (a: FishingVillageAction) => dispatch(a);

  const durabilityColor = state.boatDurability <= 3 ? "#b71c1c" : state.boatDurability <= 6 ? "#e65100" : "#2e7d32";
  const totalFishValue = Object.entries(state.fish).reduce((sum, [f, qty]) => sum + qty * FISH_PRICES[f as keyof typeof FISH_PRICES], 0);

  return (
    <div className="fv-wrap">
      <div className="fv-header">
        <span className="fv-title">🎣 Fishing Village</span>
        <span className="fv-day">Day {state.day}/{TOTAL_DAYS}</span>
        <span className="fv-weather">{WEATHER_EMOJI[state.weather]} {state.weather}</span>
        <span className="fv-coins">Coins: {state.coins}</span>
      </div>

      <div className="fv-status">
        <div className="fv-stat">⚡ Energy: {state.energy}/5</div>
        <div className="fv-stat" style={{ color: durabilityColor }}>🚢 Boat: {state.boatDurability}/10</div>
        <div className="fv-stat">🐟 Fish value: {totalFishValue}c</div>
      </div>

      <div className="fv-inventory">
        {Object.entries(state.fish).map(([f, qty]) => qty > 0 && (
          <span key={f} className="fv-fish-tag">{FISH_EMOJI[f]} {f}: {qty} ({qty * FISH_PRICES[f as keyof typeof FISH_PRICES]}c)</span>
        ))}
      </div>

      {state.phase === "choose" && (
        <div className="fv-actions">
          {ACTIONS.map(a => (
            <button key={a.action} className="fv-action-btn"
              onClick={() => d({ type: "choose", action: a.action })}>
              <div className="fv-action-label">{a.label}</div>
              <div className="fv-action-desc">{a.desc}</div>
            </button>
          ))}
        </div>
      )}

      {state.phase === "result" && (
        <div className="fv-result">
          <div className="fv-result-text">{state.lastResult}</div>
          <button className="fv-next-day" onClick={() => d({ type: "nextDay" })}>
            {state.day >= TOTAL_DAYS ? "End Season" : "Next Day →"}
          </button>
        </div>
      )}

      {state.phase === "done" && (
        <div className="fv-done">
          <div>Season Complete! Final Coins: <strong>{state.coins}</strong></div>
          <div>{state.coins >= 200 ? "🏆 Master Fisher!" : state.coins >= 120 ? "👍 Good Season!" : "🐟 Keep fishing!"}</div>
        </div>
      )}

      {state.log.length > 0 && (
        <div className="fv-log">
          {[...state.log].reverse().slice(0, 5).map((l, i) => <div key={i} className="fv-log-line">{l}</div>)}
        </div>
      )}
    </div>
  );
}
