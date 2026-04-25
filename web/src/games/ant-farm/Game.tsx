import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AntFarmState, AntFarmSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function AntFarmGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<AntFarmState, AntFarmSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  return (
    <div className="af-game">
      <div className="af-title">Ant Farm</div>
      <div className="af-stats">
        <span>Turn {state.turn}/{state.maxTurns}</span>
        <span>Food: <b>{state.food}</b></span>
        <span>Pop: <b>{state.population}</b></span>
        <span>Tunnels: {state.tunnels}</span>
      </div>
      <div className="af-roles">
        <span>Workers: {state.workers}</span>
        <span>Soldiers: {state.soldiers}</span>
        <span>Nurses: {state.nurses}</span>
      </div>

      <div className="af-log">{state.log}</div>

      {!state.over && (
        <>
          <div className="af-section">Recruit (3 food)</div>
          <div className="af-btn-row">
            <button className="af-btn" onClick={() => dispatch({ type: "recruit", role: "worker" })}>+ Worker</button>
            <button className="af-btn" onClick={() => dispatch({ type: "recruit", role: "soldier" })}>+ Soldier</button>
            <button className="af-btn" onClick={() => dispatch({ type: "recruit", role: "nurse" })}>+ Nurse</button>
          </div>
          <button className="af-dig-btn" onClick={() => dispatch({ type: "dig" })}>Dig Tunnel (5 food)</button>
          <button className="af-end-btn" onClick={() => dispatch({ type: "end-turn" })}>End Turn</button>
        </>
      )}

      {state.over && (
        <div className="af-result">
          {state.score > 0 ? "Colony survived!" : "Colony failed!"} Score: {state.score}
        </div>
      )}
    </div>
  );
}
