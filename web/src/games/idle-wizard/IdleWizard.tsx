import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { IdleWizardState, IdleWizardSettings } from "./state.js";
import { isTerminal, apprenticeCost, tomeCost } from "./state.js";
import "./IdleWizard.css";

export function IdleWizard({
  state,
  dispatch,
  onGameOver,
}: GameProps<IdleWizardState, IdleWizardSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  useEffect(() => {
    if (state.gameOver) return;
    tickRef.current = setInterval(() => {
      dispatch({ type: "tick" });
    }, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [state.gameOver, dispatch]);

  const progress = Math.min(state.spellsCast / state.spellGoal, 1) * 100;
  const appCost = apprenticeCost(state.apprentices);
  const tCost = tomeCost(state.tomes);

  return (
    <div className="iw-game">
      <div className="iw-title">Idle Wizard</div>
      <div className="iw-stats">
        <span className="iw-mana">✨ {Math.floor(state.mana)} mana</span>
        <span>Spells: {state.spellsCast}/{state.spellGoal}</span>
      </div>
      <div className="iw-progress-bar">
        <div className="iw-progress-fill" style={{ width: `${progress}%` }} />
      </div>
      {!state.gameOver && (
        <>
          <button className="iw-cast-btn" onClick={() => dispatch({ type: "cast" })} title="Cast spell">
            🔮
          </button>
          <div className="iw-info">
            <span>Power: {state.spellsPower}</span>
            <span>Tomes: {state.tomes}</span>
            <span>Apprentices: {state.apprentices}</span>
            <span>+{state.apprentices * state.tomes}/sec</span>
          </div>
          <button
            className="iw-btn"
            onClick={() => dispatch({ type: "hireApprentice" })}
            disabled={state.mana < appCost}
          >
            Hire Apprentice (+2 power) — {appCost} mana
          </button>
          <button
            className="iw-btn"
            onClick={() => dispatch({ type: "buyTome" })}
            disabled={state.mana < tCost}
          >
            Buy Tome (×output) — {tCost} mana
          </button>
        </>
      )}
      {state.gameOver && (
        <div className="iw-game-over">
          Arcane mastery achieved! {state.spellGoal} spells cast!<br />
          <span style={{ fontSize: "0.85rem", opacity: 0.75 }}>
            Mana: {Math.floor(state.mana)} | Tomes: {state.tomes}
          </span>
        </div>
      )}
    </div>
  );
}
