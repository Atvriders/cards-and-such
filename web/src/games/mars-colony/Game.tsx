import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MarsColonyState, MarsColonySettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const BUILDING_EMOJI: Record<string, string> = {
  habitat: "🏠",
  mine: "⛏️",
  farm: "🌱",
  lab: "🔬",
};

const BUILDING_DESC: Record<string, string> = {
  habitat: "Habitat (4🪨 1🔬) — +2 O₂/turn, enables growth",
  mine: "Mine (2🪨 2🔬) — +3 minerals/turn",
  farm: "Farm (3🪨 1🔬) — +3 food/turn",
  lab: "Lab (2🪨 3🔬) — +2 research/turn",
};

export function MarsColonyGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<MarsColonyState, MarsColonySettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  return (
    <div className="mc-game">
      <div className="mc-title">Mars Colony</div>
      <div className="mc-stats">
        <span>Turn: {state.turn}/{state.maxTurns}</span>
        <span>👥 {state.colonists}</span>
        <span>💨 {state.oxygen}</span>
        <span>🍎 {state.food}</span>
        <span>🪨 {state.minerals}</span>
        <span>🔬 {state.research}</span>
      </div>
      <div className="mc-log">{state.log}</div>

      {!state.over && (
        <>
          <div className="mc-section-title">Build</div>
          <div className="mc-build-btns">
            {(["habitat", "mine", "farm", "lab"] as const).map((b) => (
              <button key={b} className="mc-build-btn" onClick={() => dispatch({ type: "build", building: b })}>
                {BUILDING_EMOJI[b]} {BUILDING_DESC[b]}
              </button>
            ))}
          </div>

          <div className="mc-section-title">Buildings</div>
          <div className="mc-buildings">
            {state.buildings.length === 0
              ? <span className="mc-empty">No buildings yet</span>
              : state.buildings.map((b, i) => (
                <span key={i} className="mc-building-tag">{BUILDING_EMOJI[b.type]} {b.type}</span>
              ))
            }
          </div>

          <button className="mc-end-turn" onClick={() => dispatch({ type: "end-turn" })}>
            End Turn ▶
          </button>
        </>
      )}

      {state.over && (
        <div className="mc-result">
          {state.score > 100 ? "Colony survived!" : "Colony lost!"} Final Score: {state.score}
        </div>
      )}
    </div>
  );
}
