import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PirateDiceState, PirateDiceSettings, PirateDiceAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./PirateDice.css";

const DIE_ICONS: Record<number, string> = {
  1: "💀",
  2: "⚔️",
  3: "🗺️",
  4: "🗺️",
  5: "💎",
  6: "🪙",
};

const DIE_LABELS: Record<number, string> = {
  1: "Skull",
  2: "Saber",
  3: "Map",
  4: "Map",
  5: "Diamond",
  6: "Gold",
};

export function PirateDice({
  state,
  dispatch,
  onGameOver,
}: GameProps<PirateDiceState, PirateDiceSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { phase, lastRoll, keptMask, treasure, turnTreasure, skulls, turnsPlayed } = state;
  const target = parseInt(state.settings.target, 10);

  return (
    <div className="pd">
      <div className="pd-header">Pirate Dice — Find {target} Treasure!</div>
      <div className="pd-treasure">Treasure: {treasure} / {target} | Turns: {turnsPlayed}</div>

      <div className="pd-legend">
        <span>💀 Skull = danger</span>
        <span>🪙 Gold = 3pts</span>
        <span>💎 Diamond = 1pt</span>
        <span>⚔️ 3× Sabers = 2× score</span>
        <span>🗺️ Map = re-roll</span>
      </div>

      <div className="pd-dice">
        {lastRoll.map((v, i) => {
          const isSkull = v === 1;
          const isKept = keptMask[i];
          return (
            <div
              key={i}
              className={`pd-die${isSkull ? " skull" : ""}${isKept && !isSkull ? " kept" : ""}`}
              onClick={() => !isSkull && phase === "rolled" && dispatch({ type: "toggleKeep", index: i } as PirateDiceAction)}
              role={!isSkull && phase === "rolled" ? "button" : undefined}
              aria-label={`${DIE_LABELS[v]} die${isKept ? " (kept)" : ""}`}
            >
              {DIE_ICONS[v]}
              <span>{DIE_LABELS[v]}</span>
            </div>
          );
        })}
      </div>

      {skulls > 0 && <div className="pd-skulls">Skulls: {skulls} / 3</div>}
      {phase === "rolled" && <div className="pd-turn-score">Turn Score: {turnTreasure}</div>}

      {phase === "sunk" && (
        <div className="pd-message">Sunk! Three skulls — no treasure this turn!</div>
      )}

      {terminal && (
        <div className="pd-message won">Treasure found! Score: {terminal.score}</div>
      )}

      <div className="pd-controls">
        {phase === "preRoll" && !terminal && (
          <button data-testid="hint-target-pirate-dice-roll" onClick={() => dispatch({ type: "roll" } as PirateDiceAction)}>Roll Dice</button>
        )}
        {phase === "rolled" && (
          <>
            <button data-testid="hint-target-pirate-dice-roll" onClick={() => dispatch({ type: "roll" } as PirateDiceAction)}>Re-roll Maps</button>
            <button data-testid="hint-target-pirate-dice-bank" className="bank-btn" onClick={() => dispatch({ type: "bank" } as PirateDiceAction)} disabled={turnTreasure === 0}>
              Bank {turnTreasure} Treasure
            </button>
          </>
        )}
        {phase === "sunk" && (
          <button data-testid="hint-target-pirate-dice-nextTurn" onClick={() => dispatch({ type: "nextTurn" } as PirateDiceAction)}>Next Turn</button>
        )}
      </div>
    </div>
  );
}
