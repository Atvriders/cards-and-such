import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SlimeDefenseState, SlimeDefenseSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./SlimeDefense.css";

const LANES = 5;
const SLIME_EMOJI: Record<string, string> = { green: "🟢", blue: "🔵", red: "🔴" };

export function SlimeDefense({ state, dispatch, onGameOver }: GameProps<SlimeDefenseState, SlimeDefenseSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (terminal) { onGameOver(terminal.score); return; }
    const ms = state.settings.difficulty === "easy" ? 700 : state.settings.difficulty === "hard" ? 350 : 500;
    intervalRef.current = setInterval(() => dispatch({ type: "tick" }), ms);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [terminal, state.settings.difficulty, dispatch, onGameOver]);

  return (
    <div className="slime-defense">
      <div className="sld-hud">
        <span>Wave: {state.wave}</span>
        <span>Base HP: {state.baseHp}</span>
        <span>Gold: {state.gold}</span>
        <span>Score: {state.score}</span>
      </div>

      <div className="sld-lanes">
        {Array.from({ length: LANES }, (_, lane) => {
          const isSelected = state.selectedLane === lane;
          const isTrapped = state.traps.includes(lane);
          const laneSlimes = state.slimes.filter(s => s.lane === lane);
          return (
            <div
              key={lane}
              className={`sld-lane${isSelected ? " selected" : ""}${isTrapped ? " trapped" : ""}`}
              onClick={() => dispatch({ type: "selectLane", lane })}
            >
              {laneSlimes.map(s => {
                const bottomPct = Math.min(90, s.progress * 9);
                return (
                  <span
                    key={s.id}
                    className="sld-slime"
                    title={`HP: ${s.hp}`}
                    style={{ bottom: `${100 - bottomPct}%` }}
                  >
                    {SLIME_EMOJI[s.color]}
                  </span>
                );
              })}
              {isTrapped && <span className="sld-trap-icon">🪤</span>}
              <span className="sld-base-label">BASE</span>
            </div>
          );
        })}
      </div>

      <div className="sld-controls">
        <button
          onClick={() => dispatch({ type: "placeTrap" })}
          disabled={state.selectedLane === null || state.gold < 4 || (state.selectedLane !== null && state.traps.includes(state.selectedLane))}
        >
          Place Trap (4g){state.selectedLane !== null ? ` — Lane ${state.selectedLane + 1}` : ""}
        </button>
      </div>

      <div className="sld-hint">Click a lane to select · Place Trap · 🟢=1HP 🔵=2HP 🔴=4HP</div>

      {state.gameOver && (
        <>
          <div className="sld-game-over">Base overwhelmed! Score: {state.score}</div>
          <button onClick={() => dispatch({ type: "restart" })}>Play Again</button>
        </>
      )}
    </div>
  );
}
