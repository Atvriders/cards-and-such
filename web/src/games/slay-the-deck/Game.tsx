import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SlayTheDeckState, SlayTheDeckAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function SlayTheDeck({ state, dispatch, onGameOver }: GameProps<SlayTheDeckState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const d = (a: SlayTheDeckAction) => dispatch(a);

  const pHpPct = Math.round((state.playerHp / state.playerMaxHp) * 100);
  const eHpPct = Math.round((state.enemy.hp / state.enemy.maxHp) * 100);

  return (
    <div className="std-wrap">
      <div className="std-header">
        <span className="std-title">Slay the Deck</span>
        <span>Act {state.act}/{state.totalActs}</span>
        <span className="std-energy">Energy: {state.energy}/{state.maxEnergy}</span>
        {state.strength > 0 && <span>Strength: +{state.strength}</span>}
      </div>

      <div className="std-combatants">
        <div className="std-side">
          <div className="std-name">You</div>
          <div className="std-bar"><div className="std-fill std-pfill" style={{ width: `${pHpPct}%` }} /></div>
          <div className="std-sub">{state.playerHp}/{state.playerMaxHp} HP {state.block > 0 ? `| Block ${state.block}` : ""}</div>
        </div>
        <div className="std-side">
          <div className="std-name">{state.enemy.name}</div>
          <div className="std-bar"><div className="std-fill std-efill" style={{ width: `${eHpPct}%` }} /></div>
          <div className="std-sub">{state.enemy.hp}/{state.enemy.maxHp} HP | Intent: {state.enemy.intent}</div>
        </div>
      </div>

      {state.phase === "player" && (
        <>
          <div className="std-hand">
            {state.hand.map(c => (
              <button key={c.id}
                className={`std-card ${state.energy < c.cost ? "std-disabled" : ""}`}
                disabled={state.energy < c.cost}
                onClick={() => d({ type: "playCard", id: c.id })}>
                <div className="std-card-name">{c.name}</div>
                <div className="std-card-cost">{c.cost}E</div>
                <div className="std-card-desc">{c.desc}</div>
              </button>
            ))}
          </div>
          <button className="std-end-btn" onClick={() => d({ type: "endTurn" })}>End Turn</button>
        </>
      )}

      {state.phase === "reward" && (
        <div style={{ textAlign: "center" }}>
          <div>Act {state.act} complete!</div>
          <button className="std-next-btn" style={{ marginTop: 8 }} onClick={() => d({ type: "nextAct" })}>Next Act →</button>
        </div>
      )}

      {state.phase === "won" && <div className="std-end std-won">Victory! Score: {terminal?.score}</div>}
      {state.phase === "dead" && <div className="std-end std-dead">Defeated at act {state.act}. Score: {terminal?.score}</div>}

      <div className="std-log">
        {[...state.log].reverse().slice(0, 5).map((l, i) => <div key={i} className="std-log-line">{l}</div>)}
      </div>
    </div>
  );
}
