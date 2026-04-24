import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { IslandState } from "./state.js";
import { isTerminal, TOTAL_DAYS } from "./state.js";
import type { IslandAction, SurvivalAction } from "./state.js";
import "./Game.css";

const ACTIONS: { id: SurvivalAction; label: string; desc: string }[] = [
  { id: "food",    label: "🍖 Forage Food",   desc: "Search for fruit & animals (+30-50 food)" },
  { id: "water",   label: "💧 Find Water",    desc: "Look for streams or collect dew (+35-50 water)" },
  { id: "shelter", label: "🏕️ Build Shelter", desc: "Reinforce your camp (+25 shelter, storm protection)" },
  { id: "signal",  label: "🔥 Signal Fire",   desc: "Light a fire to attract rescue ships/planes" },
];

function StatBar({ value, color }: { value: number; color: string }): JSX.Element {
  return (
    <div className="isle-bar-bg">
      <div className="isle-bar" style={{ width: `${value}%`, background: color }} />
    </div>
  );
}

export function IslandSurvival({ state, dispatch, onGameOver }: GameProps<IslandState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const d = (a: IslandAction) => dispatch(a);

  return (
    <div className="isle-wrap">
      <div className="isle-header">
        <span className="isle-title">🏝️ Island Survival</span>
        <span className="isle-day">Day {state.day}/{TOTAL_DAYS}</span>
      </div>

      <div className="isle-stats">
        <div className="isle-stat"><span>🍖 Food</span> <StatBar value={state.food} color="#f57f17" /> <span>{state.food}</span></div>
        <div className="isle-stat"><span>💧 Water</span> <StatBar value={state.water} color="#1565c0" /> <span>{state.water}</span></div>
        <div className="isle-stat"><span>🏕️ Shelter</span> <StatBar value={state.shelter} color="#558b2f" /> <span>{state.shelter}</span></div>
        <div className="isle-stat"><span>❤️ Health</span> <StatBar value={state.health} color="#c62828" /> <span>{state.health}</span></div>
      </div>

      {state.phase === "choose" && (
        <div className="isle-actions">
          <div className="isle-prompt">Choose today's main action:</div>
          {ACTIONS.map(a => (
            <button key={a.id} className="isle-action-btn" onClick={() => d({ type: "choose", action: a.id })}>
              <span className="isle-action-label">{a.label}</span>
              <span className="isle-action-desc">{a.desc}</span>
            </button>
          ))}
        </div>
      )}

      {state.phase === "event" && (
        <div className="isle-event">
          {state.lastEvent.kind !== "none" && (
            <div className="isle-event-msg">
              {state.lastEvent.kind === "rescue" && "🚁 Rescue craft spotted!"}
              {state.lastEvent.kind === "storm" && `🌪️ Storm severity ${state.lastEvent.severity}!`}
              {state.lastEvent.kind === "rain" && "🌧️ Rainfall collected!"}
              {state.lastEvent.kind === "bounty" && "🌴 Found food!"}
            </div>
          )}
          <button className="isle-next-btn" onClick={() => d({ type: "nextDay" })}>Next Day →</button>
        </div>
      )}

      {state.phase === "done" && (
        <div className="isle-done">
          {state.rescued && <div className="isle-rescued">🚁 RESCUED! You made it home!</div>}
          {!state.survived && <div className="isle-dead">💀 You did not survive day {state.day}.</div>}
          {state.survived && !state.rescued && <div className="isle-survived">🏝️ You survived all 20 days!</div>}
          <div className="isle-score">Score: {terminal?.score ?? 0}/100</div>
        </div>
      )}

      {state.log.length > 0 && (
        <div className="isle-log">
          {[...state.log].reverse().slice(0, 5).map((l, i) => <div key={i} className="isle-log-line">{l}</div>)}
        </div>
      )}
    </div>
  );
}
