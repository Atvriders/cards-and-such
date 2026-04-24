import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PirateState } from "./state.js";
import { isTerminal, GRID_COLS, GRID_ROWS, MAX_FUEL } from "./state.js";
import type { PirateAction } from "./state.js";
import "./Game.css";

export function PiratesBounty({ state, dispatch, onGameOver }: GameProps<PirateState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const d = (a: PirateAction) => dispatch(a);

  return (
    <div className="pirate-wrap">
      <div className="pirate-header">
        <span className="pirate-title">🏴‍☠️ Pirate's Bounty</span>
        <span>⛽ Fuel: {state.fuel}/{MAX_FUEL}</span>
        <span className="pirate-gold">💰 {state.gold} gold</span>
      </div>

      <div className="pirate-status">{state.lastResult}</div>

      {state.phase === "sail" && (
        <>
          <div className="pirate-grid" style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)` }}>
            {state.islands.map((island, i) => {
              const row = Math.floor(i / GRID_COLS);
              const col = i % GRID_COLS;
              const isHere = row === state.pirateRow && col === state.pirateCol;
              const dist = Math.abs(row - state.pirateRow) + Math.abs(col - state.pirateCol);
              const fuelNeeded = dist;
              return (
                <div key={i} className={`pirate-cell ${isHere ? "here" : ""} ${island.dug ? "dug" : ""}`}>
                  <div className="pirate-cell-icon">
                    {isHere ? "🏴‍☠️" : island.dug ? (island.hasTreasure ? "💰" : "🪨") : "🏝️"}
                  </div>
                  <div className="pirate-cell-name">{island.name.split(" ")[0]}</div>
                  {!isHere && !island.dug && <div className="pirate-cell-prob">{Math.round(island.treasureProbability * 100)}%</div>}
                  {!isHere && (
                    <button className="pirate-sail-btn"
                      disabled={fuelNeeded > state.fuel}
                      onClick={() => d({ type: "sail", row, col })}>
                      ⛵ {fuelNeeded}⛽
                    </button>
                  )}
                  {isHere && !island.dug && (
                    <button className="pirate-dig-btn" onClick={() => d({ type: "dig" })}>⛏️ Dig</button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {state.phase === "done" && (
        <div className="pirate-done">
          <div className="pirate-final">Gold collected: <strong>{state.gold}</strong></div>
          <div className="pirate-result">
            {state.gold >= 300 ? "🏆 Legendary Pirate!" : state.gold >= 150 ? "👍 Good Haul!" : "⚓ Modest Take"}
          </div>
        </div>
      )}

      {state.log.length > 0 && (
        <div className="pirate-log">
          {[...state.log].reverse().slice(0, 5).map((l, i) => <div key={i} className="pirate-log-line">{l}</div>)}
        </div>
      )}
    </div>
  );
}
