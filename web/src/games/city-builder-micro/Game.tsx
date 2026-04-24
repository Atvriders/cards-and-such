import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CityBuilderState } from "./state.js";
import { isTerminal, BUILDING_INFO, GRID_SIZE, TOTAL_TURNS } from "./state.js";
import type { CityBuilderAction, BuildingType } from "./state.js";
import "./Game.css";

const BUILDABLE: BuildingType[] = ["house", "shop", "park", "factory"];

export function CityBuilderMicro({ state, dispatch, onGameOver }: GameProps<CityBuilderState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const d = (a: CityBuilderAction) => dispatch(a);

  return (
    <div className="city-wrap">
      <div className="city-header">
        <span className="city-title">🏙️ City Builder</span>
        <span className="city-turn">Turn {state.turn}/{TOTAL_TURNS}</span>
        <span className="city-budget">Budget: ${state.budget}</span>
        <span className="city-happy">Happiness: {state.happiness}</span>
      </div>

      {state.phase === "building" && (
        <>
          <div className="city-tools">
            {BUILDABLE.map(b => {
              const info = BUILDING_INFO[b];
              return (
                <button key={b}
                  className={`city-tool-btn ${state.selectedBuilding === b ? "active" : ""}`}
                  disabled={state.budget < info.cost}
                  onClick={() => d({ type: "selectBuilding", building: b })}>
                  {info.emoji} {info.label} (${info.cost})
                </button>
              );
            })}
          </div>
          <div className="city-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
            {state.grid.map((cell, i) => {
              const info = BUILDING_INFO[cell.building];
              return (
                <button key={i} className="city-cell"
                  title={info.label}
                  onClick={() => d({ type: "place", cellIndex: i })}>
                  {info.emoji}
                </button>
              );
            })}
          </div>
          <button className="city-end-btn" onClick={() => d({ type: "endTurn" })}>
            {state.turn >= TOTAL_TURNS ? "Finish City" : "End Turn →"}
          </button>
        </>
      )}

      {state.phase === "done" && (
        <div className="city-done">
          <div className="city-final">Final Happiness: <strong>{state.happiness}</strong></div>
          <div className="city-result">
            {state.happiness >= 80 ? "🏆 Thriving Metropolis!" : state.happiness >= 40 ? "👍 Pleasant Town!" : "🏚️ Needs Work!"}
          </div>
        </div>
      )}

      {state.log.length > 0 && (
        <div className="city-log">
          {[...state.log].reverse().slice(0, 5).map((l, i) => <div key={i} className="city-log-line">{l}</div>)}
        </div>
      )}
    </div>
  );
}
