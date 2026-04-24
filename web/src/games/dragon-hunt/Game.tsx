import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DragonHuntState, DragonHuntAction } from "./state.js";
import { isTerminal, TOTAL_FLOORS } from "./state.js";
import "./Game.css";

export function DragonHunt({ state, dispatch, onGameOver }: GameProps<DragonHuntState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const d = (a: DragonHuntAction) => dispatch(a);

  const pHpPct = Math.round((state.playerHp / state.playerMaxHp) * 100);
  const eHpPct = Math.round((state.enemyHp / state.enemyMaxHp) * 100);

  return (
    <div className="dh-wrap">
      <div className="dh-header">
        <span className="dh-title">Dragon Hunt</span>
        <span>Floor {state.floor}/{TOTAL_FLOORS}</span>
        <span className="dh-mana">Mana {state.mana}/{state.maxMana}</span>
        <span>Atk {state.attack} | Mag {state.magic}</span>
      </div>

      <div className="dh-combatants">
        <div className="dh-side">
          <div className="dh-name">You</div>
          <div className="dh-bar"><div className="dh-fill dh-pfill" style={{ width: `${pHpPct}%` }} /></div>
          <div className="dh-sub">{state.playerHp}/{state.playerMaxHp} HP</div>
          {state.shield > 0 && <div className="dh-shield">Shield: {state.shield}</div>}
        </div>
        <div className="dh-side">
          <div className="dh-name">{state.enemyName}</div>
          <div className="dh-bar"><div className="dh-fill dh-efill" style={{ width: `${eHpPct}%` }} /></div>
          <div className="dh-sub">{state.enemyHp}/{state.enemyMaxHp} HP | Atk: {state.enemyAtk}</div>
        </div>
      </div>

      {state.phase === "combat" && (
        <div className="dh-actions">
          <button className="dh-btn dh-strike" onClick={() => d({ type: "strike" })}>Strike ({state.attack}±)</button>
          <button className="dh-btn dh-spell" disabled={state.mana < 2} onClick={() => d({ type: "spellfire" })}>Spellfire (2 mana)</button>
          <button className="dh-btn dh-ward" onClick={() => d({ type: "ward" })}>Ward (block)</button>
          <button className="dh-btn dh-rest" onClick={() => d({ type: "rest" })}>Rest (+HP+mana)</button>
        </div>
      )}

      {state.phase === "reward" && (
        <div style={{ textAlign: "center" }}>
          <div>Floor {state.floor} cleared!</div>
          <button className="dh-next" style={{ marginTop: 8 }} onClick={() => d({ type: "nextFloor" })}>Next Floor →</button>
        </div>
      )}

      {state.phase === "won" && <div className="dh-end dh-won">Dragon slain! Score: {terminal?.score}</div>}
      {state.phase === "dead" && <div className="dh-end dh-dead">Fell on floor {state.floor}. Score: {terminal?.score}</div>}

      <div className="dh-log">
        {[...state.log].reverse().slice(0, 6).map((l, i) => <div key={i} className="dh-log-line">{l}</div>)}
      </div>
    </div>
  );
}
