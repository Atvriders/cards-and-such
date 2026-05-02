import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DicePirateState, DicePirateAction, DicePirateSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function DicePirateGame({ state, dispatch, onGameOver }: GameProps<DicePirateState, DicePirateSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="pi-wrap">
        <div className="pi-done">
          <h2>{state.hp > 0 ? "Sea Conquered" : "Davy Jones"}</h2>
          <div className="pi-final">{state.score} pts</div>
          <div className="pi-log">{state.log}</div>
        </div>
      </div>
    );
  }

  const ship = state.ships[state.current]!;

  return (
    <div className="pi-wrap">
      <div className="pi-banner">Ship {state.current + 1} / {state.ships.length} · HP {state.hp} · Score {state.score}</div>
      <div className="pi-fleet">
        {state.ships.map((s, i) => (
          <div key={i} className={`pi-ship${s.sunk ? " sunk" : ""}${i === state.current ? " here" : ""}`}>
            {s.sunk ? "_" : "/\\"}
          </div>
        ))}
      </div>
      <div className="pi-target">
        <div className="pi-name">{ship.name}</div>
        <div className="pi-meta">DEF {ship.def} · BOOTY {ship.reward}</div>
      </div>
      {state.rolls && (
        <div className="pi-row">
          {state.rolls.map((r, i) => <div key={i} className="pi-die">{r}</div>)}
          <div className="pi-sum">Σ {state.rolls.reduce((a, b) => a + b, 0)}</div>
        </div>
      )}
      <div className="pi-log">{state.log || "Roll 3d6 — sum must beat ship's defense."}</div>
      {state.phase === "fire" && (
        <button className="pi-btn" data-testid="hint-target-dice-pirate-roll" onClick={() => dispatch({ type: "fire" } as DicePirateAction)}>Fire All</button>
      )}
      {state.phase === "result" && (
        <button className="pi-btn alt" data-testid="hint-target-dice-pirate-next" onClick={() => dispatch({ type: "next" } as DicePirateAction)}>Continue</button>
      )}
    </div>
  );
}
