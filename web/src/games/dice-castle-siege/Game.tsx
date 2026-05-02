import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceCastleSiegeState, DiceCastleSiegeAction, DiceCastleSiegeSettings } from "./state.js";
import { isTerminal, WALL_MAX, TURN_LIMIT, WEAPONS } from "./state.js";
import "./Game.css";

const LABEL = { cannon: "Cannon", trebuchet: "Trebuchet", sapper: "Sapper" } as const;

export function DiceCastleSiegeGame({ state, dispatch, onGameOver }: GameProps<DiceCastleSiegeState, DiceCastleSiegeSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    const won = state.wall === 0;
    return (
      <div className="cs-wrap">
        <div className="cs-done">
          <h2>{won ? "Wall Breached!" : "Siege Failed"}</h2>
          <div className="cs-final">{state.score} pts</div>
          <div className="cs-log">{state.log}</div>
        </div>
      </div>
    );
  }

  const wallPct = (state.wall / WALL_MAX) * 100;

  return (
    <div className="cs-wrap">
      <div className="cs-banner">Turn {state.turn} / {TURN_LIMIT}</div>
      <div className="cs-stats">
        <div className="cs-stat"><div className="cs-stat-label">Wall</div><div className="cs-stat-val">{state.wall} / {WALL_MAX}</div></div>
        <div className="cs-stat"><div className="cs-stat-label">Score</div><div className="cs-stat-val">{state.score}</div></div>
      </div>
      <div className="cs-wall">
        <div className="cs-wall-fill" style={{ width: wallPct + "%" }} />
        <div className="cs-bricks">{"|".repeat(Math.max(1, Math.round(wallPct / 8)))}</div>
      </div>

      {state.rolls.length > 0 && (
        <div className="cs-row">
          {state.rolls.map((r, i) => <div key={i} className="cs-die">{r}</div>)}
          <div className="cs-result">{state.lastWeapon ? `${LABEL[state.lastWeapon]} → ${state.lastDmg}` : ""}</div>
        </div>
      )}
      <div className="cs-log">{state.log || "Pick a siege weapon. Each die roll determines damage."}</div>

      {state.phase === "choose" && (
        <div className="cs-actions">
          {WEAPONS.map(w => (
            <button
              key={w}
              className={`cs-btn ${w}`}
              disabled={state.ammo[w] <= 0}
              data-testid="hint-target-dice-castle-siege-roll" onClick={() => dispatch({ type: "fire", weapon: w } as DiceCastleSiegeAction)}
            >
              <span className="cs-w-name">{LABEL[w]}</span>
              <span className="cs-w-ammo">x{state.ammo[w]}</span>
            </button>
          ))}
        </div>
      )}
      {state.phase === "result" && (
        <button className="cs-btn next" data-testid="hint-target-dice-castle-siege-next" onClick={() => dispatch({ type: "next" } as DiceCastleSiegeAction)}>Continue</button>
      )}
    </div>
  );
}
