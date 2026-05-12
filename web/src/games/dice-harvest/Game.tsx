import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceHarvestState, DiceHarvestAction, DiceHarvestSettings } from "./state.js";
import { isTerminal, SEASONS } from "./state.js";
import "./Game.css";

export function DiceHarvestGame({ state, dispatch, onGameOver }: GameProps<DiceHarvestState, DiceHarvestSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="hv-wrap">
        <div className="hv-done bounce-in">
          <h2>Harvest Festival</h2>
          <div className="hv-final">{state.score} pts</div>
        </div>
      </div>
    );
  }

  return (
    <div className="hv-wrap fade-in">
      <div className="hv-banner">Season {state.season} / {SEASONS} · Score {state.score}</div>
      <div className="hv-fields">
        {state.fields.map((f, i) => (
          <div key={i} className={`hv-field${f !== null ? " grown" : ""}`}>
            {f !== null ? f : "·"}
          </div>
        ))}
      </div>
      <div className="hv-log">{state.log || "Plant seeds (dice values become crops). Harvest multiplies by a yield die."}</div>
      {state.phase === "plant" && (
        <button data-testid="hint-target-dice-harvest-roll" className="hv-btn plant" onClick={() => dispatch({ type: "plant" } as DiceHarvestAction)}>Plant Seeds</button>
      )}
      {state.phase === "harvest" && (
        <button className="hv-btn harvest" onClick={() => dispatch({ type: "harvest" } as DiceHarvestAction)}>Harvest</button>
      )}
    </div>
  );
}
