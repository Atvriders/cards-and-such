import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SpaceColonyState } from "./state.js";
import { isTerminal, TOTAL_DAYS } from "./state.js";
import type { SpaceColonyAction, HarvestAction } from "./state.js";
import "./Game.css";

const RESOURCES: { id: HarvestAction; label: string; icon: string; desc: string }[] = [
  { id: "oxygen", label: "Oxygen",  icon: "🌬️", desc: "Run atmospheric processors (+30-45 O₂)" },
  { id: "food",   label: "Food",    icon: "🍱", desc: "Tend hydroponic gardens (+30-45 food)" },
  { id: "energy", label: "Energy",  icon: "⚡", desc: "Charge solar/nuclear banks (+30-45 energy)" },
];

function Bar({ value }: { value: number }): JSX.Element {
  const color = value >= 50 ? "#2a7d2e" : value >= 25 ? "#f57f17" : "#c62828";
  return (
    <div className="colony-bar-bg">
      <div className="colony-bar" style={{ width: `${value}%`, background: color }} />
    </div>
  );
}

function eventDesc(e: SpaceColonyState["lastEvent"]): string {
  switch (e.kind) {
    case "solarFlare":  return `☀️ Solar flare! Lost ${e.oxygenLoss} oxygen.`;
    case "meteorite":   return `☄️ Meteorite strike! Lost ${e.foodLoss} food.`;
    case "powerSurge":  return `⚡ Power surge! Lost ${e.energyLoss} energy.`;
    case "resupply":    return `🚀 Supply ship delivered ${e.amount} ${e.resource}!`;
    case "efficiency":  return `✅ Efficiency boost! +${e.bonus} to harvested resource.`;
    default:            return "";
  }
}

export function SpaceColony({ state, dispatch, onGameOver }: GameProps<SpaceColonyState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const d = (a: SpaceColonyAction) => dispatch(a);

  return (
    <div className="colony-wrap">
      <div className="colony-header">
        <span className="colony-title">🚀 Space Colony</span>
        <span className="colony-day">Day {state.day}/{TOTAL_DAYS}</span>
        <span className="colony-col">👥 {state.colonists} colonists</span>
      </div>

      <div className="colony-resources">
        <div className="colony-res-row"><span>🌬️ Oxygen</span><Bar value={state.oxygen} /><span className="colony-val">{state.oxygen}</span></div>
        <div className="colony-res-row"><span>🍱 Food</span>  <Bar value={state.food}   /><span className="colony-val">{state.food}</span></div>
        <div className="colony-res-row"><span>⚡ Energy</span><Bar value={state.energy} /><span className="colony-val">{state.energy}</span></div>
      </div>

      {state.phase === "choose" && (
        <div className="colony-actions">
          <div className="colony-prompt">Choose today's harvest operation:</div>
          {RESOURCES.map(r => (
            <button key={r.id} className="colony-action-btn" onClick={() => d({ type: "harvest", resource: r.id })}>
              <span className="colony-action-label">{r.icon} Harvest {r.label}</span>
              <span className="colony-action-desc">{r.desc}</span>
            </button>
          ))}
        </div>
      )}

      {state.phase === "event" && (
        <div className="colony-event">
          {state.lastEvent.kind !== "none" && (
            <div className="colony-event-msg">{eventDesc(state.lastEvent)}</div>
          )}
          {state.lastEvent.kind === "none" && <div className="colony-event-quiet">Day passed without incident.</div>}
          <button className="colony-next-btn" onClick={() => d({ type: "nextDay" })}>Next Day →</button>
        </div>
      )}

      {state.phase === "done" && (
        <div className="colony-done">
          {state.survived
            ? <div className="colony-survived">🏆 Colony survived {TOTAL_DAYS} days!</div>
            : <div className="colony-dead">💀 Colony failed on day {state.day}.</div>
          }
          <div className="colony-score">Score: {terminal?.score ?? 0}/100</div>
        </div>
      )}

      {state.log.length > 0 && (
        <div className="colony-log">
          {[...state.log].reverse().slice(0, 5).map((l, i) => <div key={i} className="colony-log-line">{l}</div>)}
        </div>
      )}
    </div>
  );
}
