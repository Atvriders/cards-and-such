import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ZombieDiceState, ZombieAction, ZombieDiceSettings, DiceFace } from "./state.js";
import { isTerminal } from "./state.js";
import "./ZombieDice.css";

const FACE_ICON: Record<DiceFace, string> = {
  brain: "🧠",
  running: "🏃",
  shotgun: "💥",
};

export function ZombieDice({ state, dispatch, onGameOver }: GameProps<ZombieDiceState, ZombieDiceSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const canRoll = state.phase === "preRoll" || state.phase === "rolled";
  const canBank = state.phase === "rolled" && state.turnBrains > 0;
  const isBusted = state.phase === "busted";
  const target = parseInt(state.settings.targetBrains, 10);

  return (
    <div className="zombie-dice">
      <div className="zd-info">
        <div>
          <div className="label">Banked Brains</div>
          <div className="value">{state.bankedBrains} / {target}</div>
        </div>
        <div>
          <div className="label">This Turn</div>
          <div className="value">{state.turnBrains} brains</div>
        </div>
        <div className="zd-shotguns">
          <div className="label">Shotguns</div>
          <div className="value">{state.turnShotguns} / 3</div>
        </div>
      </div>

      {state.lastRoll.length > 0 && (
        <div className="zd-roll-area">
          {state.lastRoll.map((die, i) => (
            <div key={i} className={`zd-die ${die.color}`}>
              <span className="face-icon">{FACE_ICON[die.face]}</span>
              <span>{die.face}</span>
            </div>
          ))}
        </div>
      )}

      {isBusted && <div className="zd-bust">BANG! 3 shotguns — turn over, brains lost!</div>}

      <div className="zd-controls">
        <button onClick={() => dispatch({ type: "roll" } as ZombieAction)} disabled={!canRoll || isBusted || !!terminal}>
          {state.lastRoll.length === 0 ? "Roll" : `Roll Again (${state.rolling.length} runners + draw)`}
        </button>
        <button onClick={() => dispatch({ type: "bank" } as ZombieAction)} disabled={!canBank || !!terminal}>
          Bank {state.turnBrains} Brains
        </button>
        {isBusted && (
          <button onClick={() => dispatch({ type: "nextTurn" } as ZombieAction)}>Next Turn</button>
        )}
      </div>

      <div className="zd-pool-key">
        Pool: {state.pool.length} dice remaining | Green: safe, Yellow: balanced, Red: dangerous
      </div>

      {terminal && <div className="zd-game-over">You Win! {terminal.score} Brains Banked!</div>}
    </div>
  );
}
