import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { VikingDiceState, VikingDiceAction, VikingDiceSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./VikingDice.css";

const FACE_EMOJI: Record<string, string> = {
  axe: "🪓",
  shield: "🛡",
  skull: "💀",
};

export function VikingDice({
  state,
  dispatch,
  onGameOver,
}: GameProps<VikingDiceState, VikingDiceSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const target = parseInt(state.settings.target, 10);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { phase, turnRaid, totalRaid, shields, skulls, lastRoll } = state;
  const effectiveSkulls = Math.max(0, skulls - shields);

  return (
    <div className="viking-dice">
      <h2>VIKING DICE</h2>

      <div className="viking-header">
        <div>Raid Goal: <span>{totalRaid}</span> / <span>{target}</span></div>
        <div>This Turn: <span>{turnRaid}</span></div>
        <div>Turns: <span>{state.turnsTaken}</span></div>
      </div>

      <div className="viking-indicators">
        <span>🛡 Shields: {shields}</span>
        <span>💀 Skulls: {skulls} (effective: {effectiveSkulls})</span>
      </div>

      {lastRoll.length > 0 && (
        <div className="viking-roll-row">
          {lastRoll.map((die, i) => (
            <div key={i} className={`viking-die ${die.face}`}>
              {FACE_EMOJI[die.face]}
            </div>
          ))}
        </div>
      )}

      {phase === "busted" && (
        <div className="viking-message">BUSTED! Three skulls overwhelm your shields!</div>
      )}
      {terminal && (
        <div className="viking-message won">
          VICTORY! Raided {totalRaid} in {state.turnsTaken} turns!
        </div>
      )}

      <div className="viking-controls">
        {phase === "preRoll" && !terminal && (
          <button onClick={() => dispatch({ type: "roll" } as VikingDiceAction)}>
            Roll Dice
          </button>
        )}
        {phase === "rolled" && !terminal && (
          <>
            <button onClick={() => dispatch({ type: "roll" } as VikingDiceAction)}>
              Press Luck (+Raid)
            </button>
            <button className="bank-btn" onClick={() => dispatch({ type: "bank" } as VikingDiceAction)}>
              Bank {turnRaid} pts
            </button>
          </>
        )}
        {phase === "busted" && (
          <button onClick={() => dispatch({ type: "nextTurn" } as VikingDiceAction)}>
            Next Turn
          </button>
        )}
      </div>

      <div className="viking-legend">
        <span>🪓 Axe = +10 raid</span>
        <span>🛡 Shield = cancel a skull</span>
        <span>💀 3 skulls = bust</span>
      </div>
    </div>
  );
}
