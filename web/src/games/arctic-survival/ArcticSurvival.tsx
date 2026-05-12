import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ArcticSurvivalState, ArcticSurvivalSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./ArcticSurvival.css";

export function ArcticSurvival({ state, dispatch, onGameOver }: GameProps<ArcticSurvivalState, ArcticSurvivalSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  function bar(val: number, max: number = 10, color: string = "#4fc3f7") {
    const pct = Math.round((val / max) * 100);
    return (
      <div className="as-bar-bg">
        <div className="as-bar-fill" style={{ width: `${pct}%`, background: color }} />
        <span className="as-bar-label">{val}/{max}</span>
      </div>
    );
  }

  const eventDesc = state.event ? (
    state.event.type === "blizzard" ? "Blizzard approaching!" :
    state.event.type === "supply_cache" ? `Supply cache spotted (${state.event.resource})!` :
    state.event.type === "frostbite" ? "Frostbite risk today!" :
    "Calm conditions today."
  ) : "";

  return (
    <div className="arctic-survival">
      <div className="as-header">Arctic Survival</div>
      <div className="as-day">Day {state.day} / {state.totalDays}</div>

      {state.phase !== "gameover" && (
        <>
          <div className="as-stats">
            <div className="as-stat-row"><span>HP</span>{bar(state.hp, 10, "#ef5350")}</div>
            <div className="as-stat-row"><span>Food</span>{bar(state.food, 10, "#66bb6a")}</div>
            <div className="as-stat-row"><span>Fuel</span>{bar(state.fuel, 10, "#ffa726")}</div>
            <div className="as-stat-row"><span>Warmth</span>{bar(state.warmth, 10, "#4fc3f7")}</div>
          </div>

          {state.event && <div className="as-event">{eventDesc}</div>}

          <div className="as-actions">
            <button onClick={() => dispatch({ type: "forage" })}>Forage for Food</button>
            <button onClick={() => dispatch({ type: "rest" })}>Rest & Warm Up</button>
            <button onClick={() => dispatch({ type: "gather_fuel" })}>Gather Fuel</button>
          </div>
        </>
      )}

      <div className="as-log">
        {state.log.map((line, i) => <p key={i}>{line}</p>)}
      </div>

      {state.phase === "gameover" && (
        <div className="as-gameover bounce-in">
          <div className="as-result">{state.survived ? "You survived!" : "You perished in the cold."}</div>
          <div className="as-score pulse">Score: {state.score}</div>
          <button onClick={() => dispatch({ type: "restart" })}>Play Again</button>
        </div>
      )}
    </div>
  );
}
