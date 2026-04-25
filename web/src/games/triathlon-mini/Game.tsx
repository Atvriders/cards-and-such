import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TriathlonState, TriathlonAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const EVENT_LABELS: Record<string, string> = { swim: "Swim", bike: "Bike", run: "Run" };
const EVENT_ICONS: Record<string, string> = { swim: "🏊", bike: "🚴", run: "🏃" };

export function TriathlonMini({
  state,
  dispatch,
  onGameOver,
}: GameProps<TriathlonState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase === "done") {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => dispatch({ type: "tick" }), 100);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [state.phase, dispatch]);

  const d = (a: TriathlonAction) => dispatch(a);

  const events: Array<"swim" | "bike" | "run"> = ["swim", "bike", "run"];
  const eventStatus = (ev: string) => {
    if (state.phase === "done") return "done";
    if (state.phase === ev) return "active";
    if (events.indexOf(state.phase as "swim" | "bike" | "run") > events.indexOf(ev as "swim" | "bike" | "run")) return "done";
    return "";
  };

  const staminaColor = state.stamina >= 60 ? "#43a047" : state.stamina >= 30 ? "#ffa726" : "#ef5350";

  return (
    <div className="tri-wrap">
      <div className="tri-header">
        <span className="tri-title">Triathlon Mini</span>
        <span className="tri-score">Score: {state.score}</span>
      </div>

      <div className="tri-events">
        {events.map(ev => (
          <div key={ev} className={`tri-event ${eventStatus(ev)}`}>
            {EVENT_ICONS[ev]} {EVENT_LABELS[ev]}
          </div>
        ))}
      </div>

      {state.phase !== "done" && (
        <>
          <div className="tri-bar-row">
            <span className="tri-bar-label">Progress</span>
            <div className="tri-bar">
              <div className="tri-bar-fill" style={{ width: `${state.progress}%`, background: "#1976d2" }} />
            </div>
          </div>
          <div className="tri-bar-row">
            <span className="tri-bar-label">Stamina</span>
            <div className="tri-bar">
              <div className="tri-bar-fill" style={{ width: `${state.stamina}%`, background: staminaColor }} />
            </div>
          </div>
          <div className="tri-stats">
            <span>Speed: {state.speed.toFixed(1)}</span>
            <span>Combo: {state.combo}x</span>
          </div>
          <button className="tri-tap-btn" onClick={() => d({ type: "tap" })}>
            {EVENT_ICONS[state.phase] ?? ""} TAP — {EVENT_LABELS[state.phase] ?? state.phase}
          </button>
        </>
      )}

      {state.phase === "done" && (
        <div className="tri-done">
          <div className="tri-done-score">Final Score: {state.score}</div>
          <div>{state.score >= 80 ? "Triathlon Champion!" : state.score >= 50 ? "Great effort!" : "Keep training!"}</div>
        </div>
      )}
    </div>
  );
}
