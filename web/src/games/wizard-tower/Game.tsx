import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WizardTowerState, WizardTowerAction, Spell } from "./state.js";
import { isTerminal, SPELLS } from "./state.js";
import "./Game.css";

const SPELL_KEYS: Spell[] = ["fire", "ice", "lightning", "arcane", "shield", "drain"];

export function WizardTower({ state, dispatch, onGameOver }: GameProps<WizardTowerState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const d = (a: WizardTowerAction) => dispatch(a);

  const pHpPct = Math.round((state.playerHp / state.playerMaxHp) * 100);

  return (
    <div className="wt-wrap">
      <div className="wt-header">
        <span className="wt-title">Wizard Tower</span>
        <span>Wave {state.wave}/{state.totalWaves}</span>
        <span className="wt-mana">Mana {state.mana}/{state.maxMana}</span>
        {state.shield > 0 && <span>Shield {state.shield}</span>}
        {state.lastSpell && <span>Last: {SPELLS[state.lastSpell].name}</span>}
      </div>

      <div className="wt-player">
        <div className="wt-player-name">You</div>
        <div className="wt-bar"><div className="wt-fill wt-pfill" style={{ width: `${pHpPct}%` }} /></div>
        <div className="wt-sub">{state.playerHp}/{state.playerMaxHp} HP</div>
      </div>

      <div className="wt-combatants">
        {state.enemies.map((e, i) => {
          const pct = Math.round((e.hp / e.maxHp) * 100);
          return (
            <div key={i} className="wt-enemy">
              <div className="wt-enemy-name">{e.name}</div>
              <div className="wt-bar"><div className="wt-fill" style={{ width: `${pct}%` }} /></div>
              <div className="wt-sub">{e.hp}/{e.maxHp} HP | Atk {e.atk}</div>
            </div>
          );
        })}
      </div>

      {state.phase === "combat" && (
        <>
          <div className="wt-spells">
            {SPELL_KEYS.map(spellKey => {
              const def = SPELLS[spellKey];
              const isCombo = def.combo && state.lastSpell === def.combo;
              return (
                <button key={spellKey}
                  className="wt-spell"
                  disabled={state.mana < def.cost}
                  onClick={() => d({ type: "cast", spell: spellKey })}>
                  <div className="wt-spell-name">{def.name}</div>
                  <div className="wt-spell-cost">{def.cost} mana</div>
                  <div className="wt-spell-desc">{def.desc}</div>
                  {isCombo && <div className="wt-spell-combo">COMBO!</div>}
                </button>
              );
            })}
          </div>
          <button className="wt-end-btn" onClick={() => d({ type: "endRound" })}>End Round (+2 mana, enemies attack)</button>
        </>
      )}

      {state.phase === "waveClear" && (
        <button className="wt-next-btn" onClick={() => d({ type: "nextWave" })}>Next Wave →</button>
      )}

      {state.phase === "won" && <div className="wt-end wt-won">Tower defended! Score: {terminal?.score}</div>}
      {state.phase === "dead" && <div className="wt-end wt-dead">Overwhelmed at wave {state.wave}. Score: {terminal?.score}</div>}

      <div className="wt-log">
        {[...state.log].reverse().slice(0, 6).map((l, i) => <div key={i} className="wt-log-line">{l}</div>)}
      </div>
    </div>
  );
}
