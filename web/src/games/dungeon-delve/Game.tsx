import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DungeonDelveState, DungeonDelveAction } from "./state.js";
import { isTerminal, CARD_DEFS, TOTAL_ROOMS } from "./state.js";
import "./Game.css";

export function DungeonDelve({ state, dispatch, onGameOver }: GameProps<DungeonDelveState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const d = (a: DungeonDelveAction) => dispatch(a);

  const hpPct = Math.round((state.playerHp / state.playerMaxHp) * 100);
  const enemyPct = Math.round((state.enemy.hp / state.enemy.maxHp) * 100);

  return (
    <div className="dd-wrap">
      <div className="dd-header">
        <span className="dd-title">⚔️ Dungeon Delve</span>
        <span className="dd-room">Room {state.room}/{TOTAL_ROOMS}</span>
        <span className="dd-energy">Energy: {state.energy}</span>
      </div>

      <div className="dd-combatants">
        <div className="dd-player">
          <div className="dd-cname">🧙 You</div>
          <div className="dd-hp-bar">
            <div className="dd-hp-fill dd-player-fill" style={{ width: `${hpPct}%` }} />
          </div>
          <div className="dd-stats">{state.playerHp}/{state.playerMaxHp} HP {state.block > 0 && `🛡️${state.block}`}</div>
        </div>
        <div className="dd-vs">VS</div>
        <div className="dd-enemy">
          <div className="dd-cname">👹 {state.enemy.name}</div>
          <div className="dd-hp-bar">
            <div className="dd-hp-fill dd-enemy-fill" style={{ width: `${enemyPct}%` }} />
          </div>
          <div className="dd-stats">{state.enemy.hp}/{state.enemy.maxHp} HP (atk {state.enemy.attack})</div>
        </div>
      </div>

      {state.phase === "combat" && (
        <>
          <div className="dd-hand">
            {state.hand.map(card => (
              <button key={card.id}
                className={`dd-card ${state.energy < card.cost && card.type !== "rage" ? "dd-card-disabled" : ""}`}
                disabled={state.energy < card.cost && card.type !== "rage"}
                onClick={() => d({ type: "playCard", cardId: card.id })}>
                <div className="dd-card-name">{card.name}</div>
                <div className="dd-card-cost">{card.cost === 0 ? "Free" : `${card.cost}E`}</div>
                <div className="dd-card-desc">{CARD_DEFS[card.type].desc}</div>
              </button>
            ))}
          </div>
          <button className="dd-end-turn" onClick={() => d({ type: "endTurn" })}>End Turn →</button>
        </>
      )}

      {state.phase === "reward" && (
        <div className="dd-reward">
          <div>Victory! You cleared room {state.room}.</div>
          <div className="dd-heal-note">+{Math.round(state.playerMaxHp * 0.2)} HP restored</div>
          <button className="dd-next" onClick={() => d({ type: "nextRoom" })}>Next Room →</button>
        </div>
      )}

      {state.phase === "done" && (
        <div className="dd-done">🏆 You conquered all {TOTAL_ROOMS} rooms!</div>
      )}
      {state.phase === "dead" && (
        <div className="dd-dead">💀 Defeated in room {state.room}. Score: {isTerminal(state)?.score}/100</div>
      )}

      {state.log.length > 0 && (
        <div className="dd-log">
          {[...state.log].reverse().slice(0, 6).map((l, i) => <div key={i} className="dd-log-line">{l}</div>)}
        </div>
      )}
    </div>
  );
}
