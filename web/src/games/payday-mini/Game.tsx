import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PaydayState, PaydayAction, PaydaySettings } from "./state.js";
import { isTerminal, score, DAYS } from "./state.js";
import "./Game.css";

export function PaydayMiniGame({ state, dispatch, onGameOver }: GameProps<PaydayState, PaydaySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const last = state.log[state.log.length - 1];
  return (
    <div className="pd-wrap">
      <div className="pd-head">Day <b>{state.day}</b> / {DAYS} — Bank <b>${state.bank}</b></div>
      <div className="pd-cal">
        {Array.from({ length: DAYS }, (_, i) => {
          const entry = state.log.find(l => l.day === i + 1);
          const cls = entry ? (entry.amount >= 0 ? "pd-pos" : "pd-neg") : "";
          return <div key={i} className={`pd-day ${cls}${i + 1 === state.day ? " pd-here" : ""}`}>{i + 1}</div>;
        })}
      </div>
      {state.phase === "rolling" && <button className="pd-btn" onClick={() => dispatch({ type: "roll" } as PaydayAction)}>Roll Day {state.day}</button>}
      {state.phase === "resolved" && last && (
        <div className="pd-event">
          Day {last.day}: {last.label} ({last.amount >= 0 ? "+" : ""}${last.amount})
          <button className="pd-btn alt" onClick={() => dispatch({ type: "next" } as PaydayAction)}>Next Day</button>
        </div>
      )}
      {state.phase === "done" && <div className="pd-done">Month over! Net Worth: ${score(state)}</div>}
    </div>
  );
}
