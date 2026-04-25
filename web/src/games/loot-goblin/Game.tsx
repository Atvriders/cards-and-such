import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LootGoblinState, LootGoblinAction } from "./state.js";
import { isTerminal, getRooms } from "./state.js";
import "./Game.css";

export function LootGoblin({ state, dispatch, onGameOver }: GameProps<LootGoblinState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const d = (a: LootGoblinAction) => dispatch(a);
  const rooms = getRooms();
  const currentRoom = rooms[Math.min(state.currentRoom, rooms.length - 1)]!;

  if (state.phase === "done") {
    return (
      <div className="lg-wrap">
        <div className="lg-header"><span className="lg-title">Loot Goblin</span></div>
        <div className="lg-done">
          <div className="lg-done-title">Escaped!</div>
          <div>Total Gold: {state.gold}g</div>
          <div>Score: {terminal?.score ?? 0}/100</div>
        </div>
        <div className="lg-log">
          {[...state.log].reverse().slice(0, 6).map((l, i) => <div key={i} className="lg-log-line">{l}</div>)}
        </div>
      </div>
    );
  }

  if (state.phase === "dead") {
    return (
      <div className="lg-wrap">
        <div className="lg-header"><span className="lg-title">Loot Goblin</span></div>
        <div className="lg-dead">
          <div>Caught by traps! Banked Gold: {state.gold}g</div>
          <div>Score: {terminal?.score ?? 0}/100</div>
        </div>
        <div className="lg-log">
          {[...state.log].reverse().slice(0, 6).map((l, i) => <div key={i} className="lg-log-line">{l}</div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="lg-wrap">
      <div className="lg-header">
        <span className="lg-title">Loot Goblin</span>
        <div className="lg-stats">
          <span>Banked: {state.gold}g</span>
          <span>Held: {state.heldGold}g</span>
          <span className="lg-traps">Traps: {state.trapTokens}/3</span>
        </div>
      </div>

      <div className="lg-trap-tokens">
        {[0, 1, 2].map(i => <span key={i} className={`lg-token ${i < state.trapTokens ? "" : "lg-token-empty"}`} />)}
        <span style={{ fontSize: "0.75rem", marginLeft: 8, color: "#777" }}>trap tokens (3 = caught)</span>
      </div>

      <div className="lg-room-card">
        <div className="lg-room-name">{currentRoom.name}</div>
        <div className="lg-room-info">
          <span>Loot: {currentRoom.loot}g</span>
          <span>Trap dice: {currentRoom.trapDice}d6 (5-6 = trap)</span>
        </div>
        {state.lastDice && (
          <div className="lg-dice-row">
            {state.lastDice.map((r, i) => (
              <div key={i} className={`lg-die ${r >= 5 ? "lg-die-trap" : ""}`}>{r}</div>
            ))}
          </div>
        )}
      </div>

      <div className="lg-held">Held gold this run: {state.heldGold}g</div>

      {state.phase === "choose" && (
        <div className="lg-choices">
          <button className="lg-btn lg-btn-enter" onClick={() => d({ type: "enterRoom" })}>
            Enter Room →
          </button>
        </div>
      )}

      {state.phase === "rolled" && (
        <div className="lg-choices">
          <button className="lg-btn lg-btn-bank" onClick={() => d({ type: "bankAndEscape" })}>
            Bank & Escape ({state.heldGold}g)
          </button>
          <button className="lg-btn lg-btn-press" onClick={() => d({ type: "pressOn" })}>
            Press On →
          </button>
        </div>
      )}

      <div className="lg-log">
        {[...state.log].reverse().slice(0, 5).map((l, i) => <div key={i} className="lg-log-line">{l}</div>)}
      </div>
    </div>
  );
}
