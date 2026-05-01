import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceGalaxyState, DiceGalaxyAction, DiceGalaxySettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function DiceGalaxyGame({ state, dispatch, onGameOver }: GameProps<DiceGalaxyState, DiceGalaxySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="ga-wrap">
        <div className="ga-stars" />
        <div className="ga-done">
          <h2>Mission Logbook</h2>
          <div className="ga-final">{state.score} pts</div>
          <div className="ga-log">{state.log}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="ga-wrap">
      <div className="ga-stars" />
      <div className="ga-banner">Fuel {state.fuel} · Score {state.score}</div>
      <div className="ga-planets">
        {state.planets.map((p, i) => (
          <button
            key={i}
            className={`ga-planet${p.visited ? " visited" : ""}${state.selected === i ? " selected" : ""}`}
            disabled={p.visited || state.phase !== "roll"}
            onClick={() => dispatch({ type: "select", idx: i } as DiceGalaxyAction)}
          >
            <div className="ga-planet-orb" />
            <div className="ga-planet-name">{p.name}</div>
            <div className="ga-planet-meta">need {p.need} · +{p.reward}</div>
          </button>
        ))}
      </div>
      {state.rolls && (
        <div className="ga-row">
          {state.rolls.map((r, i) => <div key={i} className="ga-die">{r}</div>)}
          <div className="ga-sum">Σ {state.rolls.reduce((a, b) => a + b, 0)}</div>
        </div>
      )}
      <div className="ga-log">{state.log || "Pick a planet. Roll three dice — sum must meet the need."}</div>
      {state.phase === "result" && (
        <button className="ga-btn" onClick={() => dispatch({ type: "next" } as DiceGalaxyAction)}>Continue</button>
      )}
    </div>
  );
}
