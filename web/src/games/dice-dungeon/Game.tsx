import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceDungeonState, DiceDungeonAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function DiceDungeon({ state, dispatch, onGameOver }: GameProps<DiceDungeonState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const d = (a: DiceDungeonAction) => dispatch(a);

  const playerHpPct = Math.round((state.playerHp / state.playerMaxHp) * 100);
  const enemyHpPct = Math.round((state.enemyHp / state.enemyMaxHp) * 100);

  return (
    <div className="ddu-wrap">
      <div className="ddu-header">
        <span className="ddu-title">Dice Dungeon</span>
        <span>Room {state.room}/{state.totalRooms}</span>
        <span>Your dice: {state.playerDice}d6</span>
      </div>

      <div className="ddu-combatants">
        <div className="ddu-side">
          <div className="ddu-name">You</div>
          <div className="ddu-hp-bar"><div className="ddu-hp-fill ddu-player-hp" style={{ width: `${playerHpPct}%` }} /></div>
          <div className="ddu-hp-text">{state.playerHp}/{state.playerMaxHp} HP</div>
          {state.shield > 0 && <div className="ddu-shield">Shield: {state.shield}</div>}
          {state.lastRoll.length > 0 && (
            <div className="ddu-dice">{state.lastRoll.map((v, i) => <div key={i} className="ddu-die">{v}</div>)}</div>
          )}
        </div>
        <div className="ddu-side">
          <div className="ddu-name">{state.enemyName}</div>
          <div className="ddu-hp-bar"><div className="ddu-hp-fill ddu-enemy-hp" style={{ width: `${enemyHpPct}%` }} /></div>
          <div className="ddu-hp-text">{state.enemyHp}/{state.enemyMaxHp} HP</div>
          <div className="ddu-hp-text">Atk: {state.enemyDice}d6</div>
          {state.lastEnemyRoll.length > 0 && (
            <div className="ddu-dice">{state.lastEnemyRoll.map((v, i) => <div key={i} className="ddu-die" style={{ borderColor: "#b71c1c" }}>{v}</div>)}</div>
          )}
        </div>
      </div>

      {state.phase === "roll" && (
        <div className="ddu-actions">
          <button data-testid="hint-target-dice-dungeon-roll" className="ddu-btn ddu-attack" onClick={() => d({ type: "rollAttack" })}>Roll Attack ({state.playerDice}d6)</button>
          <button className="ddu-btn ddu-defend" onClick={() => d({ type: "rollDefend" })}>Roll Defend ({state.playerDice}d6)</button>
        </div>
      )}

      {state.phase === "reward" && (
        <div style={{ textAlign: "center" }}>
          <div style={{ marginBottom: 8 }}>Room {state.room} cleared!</div>
          <button data-testid="hint-target-dice-dungeon-next" className="ddu-next" onClick={() => d({ type: "nextRoom" })}>Next Room →</button>
        </div>
      )}

      {state.phase === "won" && <div className="ddu-end ddu-won">Victory! Score: {terminal?.score}</div>}
      {state.phase === "dead" && <div className="ddu-end ddu-dead">Defeated in room {state.room}. Score: {terminal?.score}</div>}

      <div className="ddu-log">
        {[...state.log].reverse().slice(0, 6).map((l, i) => <div key={i} className="ddu-log-line">{l}</div>)}
      </div>
    </div>
  );
}
