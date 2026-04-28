import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RiskState, RiskAction, RiskSettings } from "./state.js";
import { isTerminal, score, TERRITORY_NAMES } from "./state.js";
import "./Game.css";

export function RiskMiniGame({ state, dispatch, onGameOver }: GameProps<RiskState, RiskSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="rm-wrap">
      <div className="rm-stats">Turn {state.turn} — {state.message}</div>
      <div className="rm-map">
        {state.armies.map((a, i) => (
          <button
            key={i}
            className={`rm-terr rm-${state.owner[i]}${state.selected === i ? " rm-sel" : ""}`}
            onClick={() => (state.phase === "select-attacker" || state.phase === "select-target") && dispatch({ type: "select", idx: i } as RiskAction)}
            disabled={state.phase !== "select-attacker" && state.phase !== "select-target"}
          >
            <div className="rm-name">{TERRITORY_NAMES[i]}</div>
            <div className="rm-armies">{a}</div>
            <div className="rm-owner">{state.owner[i] === "p" ? "YOU" : "CPU"}</div>
          </button>
        ))}
      </div>
      {state.phase === "resolve" && (
        <div className="rm-buttons">
          <button onClick={() => dispatch({ type: "attack" } as RiskAction)}>Attack!</button>
        </div>
      )}
      {(state.phase === "select-attacker" || state.phase === "select-target") && (
        <button className="rm-end" onClick={() => dispatch({ type: "end" } as RiskAction)}>End Turn</button>
      )}
      {state.phase === "ai" && <button className="rm-btn alt" onClick={() => dispatch({ type: "ai" } as RiskAction)}>CPU Turn</button>}
      {state.phase === "done" && <div className="rm-done">{state.message} — Score: {score(state)}</div>}
    </div>
  );
}
