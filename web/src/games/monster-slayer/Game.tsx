import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MonsterSlayerState, MonsterSlayerAction, AbilityType, Ability } from "./state.js";
import { isTerminal, ABILITIES } from "./state.js";
import "./Game.css";

export function MonsterSlayer({ state, dispatch, onGameOver }: GameProps<MonsterSlayerState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const d = (a: MonsterSlayerAction) => dispatch(a);
  const hpPct = Math.round((state.playerHp / state.playerMaxHp) * 100);
  const mHpPct = Math.round((state.monster.hp / state.monster.maxHp) * 100);

  return (
    <div className="ms-wrap">
      <div className="ms-header">
        <span className="ms-title">Monster Slayer</span>
        <span className="ms-wave">Wave {state.wave}/{state.maxWaves}</span>
      </div>

      <div className="ms-combatants">
        <div className="ms-side">
          <div className="ms-cname">Hero</div>
          <div className="ms-hp-bar"><div className="ms-hp-fill ms-player-fill" style={{ width: `${hpPct}%` }} /></div>
          <div className="ms-stats">{state.playerHp}/{state.playerMaxHp} HP | Armor {state.playerArmor + state.tempArmor}</div>
        </div>
        <div className="ms-vs">VS</div>
        <div className="ms-side">
          <div className="ms-cname">{state.monster.name}{state.monsterStunned > 0 ? " [STUNNED]" : ""}</div>
          <div className="ms-hp-bar"><div className="ms-hp-fill ms-enemy-fill" style={{ width: `${mHpPct}%` }} /></div>
          <div className="ms-stats">{state.monster.hp}/{state.monster.maxHp} HP | Atk {state.monster.attack} | Arm {state.monster.armor}</div>
        </div>
      </div>

      {state.phase === "combat" && (
        <div className="ms-abilities">
          {ABILITIES.map((ab: Ability) => {
            const cd = state.cooldowns[ab.type];
            return (
              <button key={ab.type} className="ms-ability" disabled={cd > 0}
                onClick={() => d({ type: "useAbility", ability: ab.type as AbilityType })}>
                <div className="ms-ability-name">{ab.name}</div>
                <div className="ms-ability-desc">{ab.desc}</div>
                {cd > 0 && <div className="ms-ability-cd">Cooldown: {cd}</div>}
              </button>
            );
          })}
        </div>
      )}

      {state.phase === "reward" && (
        <div className="ms-reward">
          <div>{state.monster.name} defeated!</div>
          <button className="ms-next" onClick={() => d({ type: "nextWave" })}>Next Wave →</button>
        </div>
      )}
      {state.phase === "done" && <div className="ms-done">All monsters slain! Score: 100</div>}
      {state.phase === "dead" && <div className="ms-dead">Fallen in wave {state.wave}. Score: {terminal?.score ?? 0}/100</div>}

      <div className="ms-log">
        {[...state.log].reverse().slice(0, 6).map((l, i) => <div key={i} className="ms-log-line">{l}</div>)}
      </div>
    </div>
  );
}
