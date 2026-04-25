import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ForagerState, ForagerAction, Resource } from "./state.js";
import { isTerminal, RESOURCES, TOTAL_SEASONS, DAYS_PER_SEASON } from "./state.js";
import "./Game.css";

const SEASON_EMOJI: Record<string, string> = { spring: "🌸", summer: "☀️", autumn: "🍂", winter: "❄️" };
const SEASON_ORDER = ["spring", "summer", "autumn", "winter"];
const RES_LIST = Object.keys(RESOURCES) as Resource[];

export function ForagerGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<ForagerState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const d = (a: ForagerAction) => dispatch(a);
  const season: string = SEASON_ORDER[state.seasonIdx] ?? "spring";
  const totalCache = Object.values(state.cache).reduce((a, b) => a + b, 0);

  return (
    <div className="forager-wrap">
      <div className="forager-header">
        <span className="forager-title">🌿 Forager</span>
        <span className="forager-season">{SEASON_EMOJI[season]} {season} day {state.day}/{DAYS_PER_SEASON}</span>
        <span>Season {state.seasonIdx + 1}/{TOTAL_SEASONS}</span>
      </div>

      <div className="forager-stats">
        <div className="forager-stat-box">
          <div className="forager-stat-label">Energy</div>
          <div className="forager-stat-val">{state.energy}/10</div>
        </div>
        <div className="forager-stat-box">
          <div className="forager-stat-label">Food</div>
          <div className="forager-stat-val">{state.food}</div>
        </div>
        <div className="forager-stat-box">
          <div className="forager-stat-label">Cache</div>
          <div className="forager-stat-val">{totalCache}</div>
        </div>
      </div>

      <div className="forager-cache">
        {RES_LIST.map(r => (
          <div key={r} className="forager-cache-item">
            <div>{RESOURCES[r].label}</div>
            <div style={{ fontWeight: "bold" }}>{state.cache[r]}</div>
          </div>
        ))}
      </div>

      {state.phase === "forage" && (
        <div>
          <div style={{ fontWeight: "bold", marginBottom: 8 }}>What will you forage?</div>
          <div className="forager-resources">
            {RES_LIST.map(r => {
              const info = RESOURCES[r];
              const inSeason = (info.seasons as string[]).includes(season);
              const canForage = state.energy >= info.energyCost;
              return (
                <button
                  key={r}
                  className="forager-res-btn"
                  disabled={!canForage}
                  onClick={() => d({ type: "forage", resource: r })}>
                  <div className="forager-res-name">{info.label}</div>
                  <div className="forager-res-info">⚡{info.energyCost} · ~{info.baseYield} yield</div>
                  <div className="forager-res-season">{inSeason ? "✓ In season" : "⚠ Off season"}</div>
                </button>
              );
            })}
          </div>
          <button className="forager-rest-btn" onClick={() => d({ type: "rest" })}>
            Rest (+4 energy)
          </button>
        </div>
      )}

      {state.phase === "camp" && (
        <div>
          <div className="forager-haul">
            {Object.values(state.lastHaul).some(v => v > 0) ? (
              <>
                <div>Gathered:</div>
                {RES_LIST.filter(r => state.lastHaul[r] > 0).map(r => (
                  <div key={r} className="forager-haul-val">{state.lastHaul[r]} {RESOURCES[r].label}</div>
                ))}
              </>
            ) : <div>Rested at camp.</div>}
          </div>
          <button className="forager-next-btn" onClick={() => d({ type: "nextDay" })}>
            {state.day >= DAYS_PER_SEASON && state.seasonIdx < TOTAL_SEASONS - 1
              ? `Next Season →`
              : state.day >= DAYS_PER_SEASON ? "Final Tally" : "Next Day →"}
          </button>
        </div>
      )}

      {state.phase === "done" && (
        <div className="forager-done">
          <div className="forager-final">Cache: {totalCache} | Food: {state.food}</div>
          <div>{totalCache >= 50 ? "🏆 Master Forager!" : totalCache >= 25 ? "👍 Good haul!" : "🍃 Keep exploring!"}</div>
        </div>
      )}

      {state.log.length > 0 && (
        <div className="forager-log">
          {[...state.log].reverse().slice(0, 8).map((l, i) => <div key={i} className="forager-log-line">{l}</div>)}
        </div>
      )}
    </div>
  );
}
