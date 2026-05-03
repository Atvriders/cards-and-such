import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GladiatorArenaState, GladiatorArenaSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./GladiatorArena.css";

function HpBar({ hp, maxHp }: { hp: number; maxHp: number }): JSX.Element {
  const pct = Math.max(0, (hp / maxHp) * 100);
  return (
    <div className="ga-hp-bar-bg">
      <div className="ga-hp-bar" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function GladiatorArena({ state, dispatch, onGameOver }: GameProps<GladiatorArenaState, GladiatorArenaSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const canAct = !state.gameOver && !state.actionUsed;

  return (
    <div className="gladiator-arena">
      <div className="ga-title">⚔️ GLADIATOR ARENA ⚔️</div>
      <div className="ga-round">Round {state.round}</div>

      <div className="ga-fighters">
        <div className="ga-fighter">
          <div className="ga-fighter-name">You</div>
          <HpBar hp={state.player.hp} maxHp={state.player.maxHp} />
          <div className="ga-stat">HP: {state.player.hp}/{state.player.maxHp}</div>
          <div className="ga-stat">ATK: {state.player.attack} DEF: {state.player.defense}</div>
        </div>

        <div style={{ fontSize: "1.5rem", alignSelf: "center" }}>VS</div>

        <div className="ga-fighter">
          <div className="ga-fighter-name">{state.opponent.name}</div>
          <HpBar hp={state.opponent.hp} maxHp={state.opponent.maxHp} />
          <div className="ga-stat">HP: {state.opponent.hp}/{state.opponent.maxHp}</div>
          <div className="ga-stat">ATK: {state.opponent.attack} DEF: {state.opponent.defense}</div>
        </div>
      </div>

      <div className="ga-log">
        {state.log.map((line, i) => <p key={i}>{line}</p>)}
      </div>

      <div className="ga-controls">
        <button data-testid="hint-target-gladiator-arena-action" onClick={() => dispatch({ type: "strike" })} disabled={!canAct}>Strike</button>
        <button onClick={() => dispatch({ type: "powerStrike" })} disabled={!canAct}>Power Strike</button>
        <button onClick={() => dispatch({ type: "defend" })} disabled={!canAct}>Defend</button>
        {state.actionUsed && !state.gameOver && (
          <button onClick={() => dispatch({ type: "strike" })}>Next Round ▶</button>
        )}
      </div>

      {state.gameOver && (
        <>
          <div className="ga-game-over">Fallen after {state.round - 1} victories!</div>
          <button onClick={() => dispatch({ type: "restart" })}>Fight Again</button>
        </>
      )}
    </div>
  );
}
