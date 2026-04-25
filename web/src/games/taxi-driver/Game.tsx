import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TaxiState, TaxiAction, Zone } from "./state.js";
import { isTerminal, ZONES, TOTAL_SHIFTS, REFUEL_COST, MAX_FUEL } from "./state.js";
import "./Game.css";

const ZONE_LIST = Object.keys(ZONES) as Zone[];

export function TaxiDriverGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<TaxiState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const d = (a: TaxiAction) => dispatch(a);
  const fuelPct = (state.fuel / MAX_FUEL) * 100;

  return (
    <div className="taxi-wrap">
      <div className="taxi-header">
        <span className="taxi-title">🚕 Taxi Driver Sim</span>
        <span className="taxi-stat">Shift {state.shift}/{TOTAL_SHIFTS}</span>
        <span className="taxi-stat taxi-cash">${state.cash}</span>
      </div>

      <div className="taxi-stat" style={{ marginBottom: 2 }}>Fuel: {state.fuel}/{MAX_FUEL}</div>
      <div className="taxi-fuel-bar">
        <div className="taxi-fuel-fill" style={{ width: `${fuelPct}%` }} />
      </div>

      {state.phase === "pick" && (
        <div>
          <div style={{ fontWeight: "bold", marginBottom: 8 }}>Choose a zone:</div>
          <div className="taxi-zones">
            {ZONE_LIST.map(zone => {
              const info = ZONES[zone];
              const canGo = state.fuel >= info.fuelUse;
              return (
                <button
                  key={zone}
                  className="taxi-zone-btn"
                  disabled={!canGo}
                  onClick={() => d({ type: "pickZone", zone })}>
                  <div className="taxi-zone-name">{info.label}</div>
                  <div className="taxi-zone-info">~${info.baseFare} fare · ⛽{info.fuelUse}</div>
                  <div className="taxi-zone-info">Tip chance: {Math.round(info.tipChance * 100)}%</div>
                </button>
              );
            })}
          </div>
          <button
            className="taxi-refuel-btn"
            disabled={state.cash < REFUEL_COST || state.fuel === MAX_FUEL}
            onClick={() => d({ type: "refuel" })}>
            Refuel (${REFUEL_COST}) — restores to {MAX_FUEL}
          </button>
        </div>
      )}

      {state.phase === "drive" && (
        <div>
          <div className="taxi-result">
            <div style={{ marginBottom: 4 }}>{ZONES[state.zone].label}</div>
            {state.fare > 0 ? (
              <>
                <div className="taxi-result-fare">+${state.fare}</div>
                {state.tip > 0 && <div className="taxi-result-tip">+${state.tip} tip!</div>}
              </>
            ) : (
              <div style={{ color: "#f44336" }}>No passenger — wasted {state.fuelCost} fuel</div>
            )}
          </div>
          <button className="taxi-next-btn" onClick={() => d({ type: "nextShift" })}>
            {state.shift >= TOTAL_SHIFTS ? "End of Day" : "Next Shift →"}
          </button>
        </div>
      )}

      {state.phase === "done" && (
        <div className="taxi-done">
          <div className="taxi-final">Final Earnings: ${state.cash}</div>
          <div>
            {state.cash >= 350 ? "🏆 Top Driver!" : state.cash >= 200 ? "👍 Good run!" : "💸 Keep at it!"}
          </div>
        </div>
      )}

      {state.log.length > 0 && (
        <div className="taxi-log">
          {[...state.log].reverse().map((l, i) => <div key={i} className="taxi-log-line">{l}</div>)}
        </div>
      )}
    </div>
  );
}
