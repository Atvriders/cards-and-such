import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HotelState, HotelAction } from "./state.js";
import { isTerminal, TOTAL_WEEKS, ROOM_COST, AMENITY_COST, SEASON_LABEL } from "./state.js";
import "./Game.css";

const SEASON_EMOJI: Record<string, string> = {
  peak: "🔥",
  shoulder: "🌤️",
  offSeason: "❄️",
};

export function HotelTycoon({
  state,
  dispatch,
  onGameOver,
}: GameProps<HotelState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const d = (a: HotelAction) => dispatch(a);
  const stars = "⭐".repeat(Math.round(state.guestRating));

  return (
    <div className="hotel-wrap">
      <div className="hotel-header">
        <span className="hotel-title">🏨 Hotel Tycoon</span>
        <span className="hotel-week">Week {state.week}/{TOTAL_WEEKS}</span>
        <span className="hotel-cash">${state.cash}</span>
      </div>

      <div className="hotel-info">
        <div className="hotel-badge">Rooms: {state.rooms}</div>
        <div className="hotel-badge">Amenities: {state.amenities}/4</div>
        <div className="hotel-badge">Rating: {stars}</div>
      </div>

      {state.phase !== "done" && (
        <div className="hotel-season">
          {SEASON_EMOJI[state.season]} <strong>{SEASON_LABEL[state.season]}</strong>
        </div>
      )}

      {state.phase === "plan" && (
        <div className="hotel-plan">
          <label>
            Nightly Rate: <strong>${state.ratePerNight}/night</strong>
            <input type="range" min={40} max={200} step={10} value={state.ratePerNight}
              onChange={e => d({ type: "setRate", value: +e.target.value })} />
          </label>
          <label>
            Marketing: <strong>${state.marketing}/week</strong>
            <input type="range" min={0} max={80} step={10} value={state.marketing}
              onChange={e => d({ type: "setMarketing", value: +e.target.value })} />
          </label>
          <div className="hotel-invest">
            <button className="hotel-invest-btn"
              disabled={state.rooms >= 30 || state.cash < ROOM_COST}
              onClick={() => d({ type: "buyRoom" })}>
              +1 Room (${ROOM_COST})
            </button>
            <button className="hotel-invest-btn"
              disabled={state.amenities >= 4 || state.cash < AMENITY_COST}
              onClick={() => d({ type: "buyAmenity" })}>
              Amenity (${AMENITY_COST})
            </button>
          </div>
          <div style={{ fontSize: "0.82rem", color: "#888" }}>
            Operating cost: ~${state.rooms * 5 * 7 + state.marketing}/week
          </div>
          <button className="hotel-btn" onClick={() => d({ type: "runWeek" })}>Run Week!</button>
        </div>
      )}

      {state.phase === "results" && (
        <div className="hotel-results">
          <div className="hotel-result-row">Avg nightly occupancy: <strong>{state.lastOccupied}/{state.rooms} rooms</strong></div>
          <div className="hotel-result-row">Weekly revenue: ${state.lastRevenue}</div>
          <div className="hotel-result-row">Operating costs: ${state.lastCost}</div>
          <div className={`hotel-result-row profit ${state.lastProfit >= 0 ? "pos" : "neg"}`}>
            Profit: {state.lastProfit >= 0 ? "+" : ""}${state.lastProfit}
          </div>
          <button className="hotel-btn" onClick={() => d({ type: "nextWeek" })}>
            {state.week >= TOTAL_WEEKS ? "Check Out (Final Score)" : "Next Week →"}
          </button>
        </div>
      )}

      {state.phase === "done" && (
        <div className="hotel-done">
          <div className="hotel-final">Final Cash: <strong>${state.cash}</strong></div>
          <div>{state.cash >= 4000 ? "🏆 5-Star Empire!" : state.cash >= 2000 ? "👍 Profitable hotel!" : "📉 Rooms to improve"}</div>
        </div>
      )}

      {state.log.length > 0 && (
        <div className="hotel-log">
          {[...state.log].reverse().map((l, i) => <div key={i} className="hotel-log-line">{l}</div>)}
        </div>
      )}
    </div>
  );
}
