import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiddlerState, DiddlerSettings } from "./state.js";
import { isTerminal, ROUNDS_TO_WIN } from "./state.js";
import "./Game.css";

const DICE_FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export function DiddlerGame({ state, dispatch, onGameOver }: GameProps<DiddlerState, DiddlerSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  // Local arrangement state: slots holds die indices (or null)
  const [slots, setSlots] = useState<(number | null)[]>([null, null, null]);
  const [selected, setSelected] = useState<number | null>(null);

  // Reset slots when a new round starts
  useEffect(() => {
    if (state.phase === "arranging") setSlots([null, null, null]);
  }, [state.phase, state.playerDice.join(",")]);

  const placed = new Set(slots.filter((s) => s !== null) as number[]);
  const unplaced = [0, 1, 2].filter((i) => !placed.has(i));
  const allFilled = slots.every((s) => s !== null);

  function handleDieClick(dieIdx: number) {
    if (state.phase !== "arranging") return;
    if (placed.has(dieIdx)) {
      // Remove from slot
      setSlots((prev) => prev.map((s) => s === dieIdx ? null : s));
      setSelected(null);
    } else {
      setSelected(dieIdx === selected ? null : dieIdx);
    }
  }

  function handleSlotClick(slotIdx: number) {
    if (state.phase !== "arranging") return;
    if (selected !== null) {
      // Place selected die into this slot
      const existing = slots[slotIdx];
      const newSlots = [...slots];
      if (existing !== null) {
        // Swap back to unplaced
        newSlots[slotIdx] = selected;
      } else {
        newSlots[slotIdx] = selected;
      }
      setSlots(newSlots);
      setSelected(null);
    } else if (slots[slotIdx] !== null) {
      // Remove die from this slot
      setSlots((prev) => prev.map((s, i) => i === slotIdx ? null : s));
    }
  }

  function submitOrder() {
    const order = slots as number[];
    dispatch({ type: "setOrder", order });
  }

  const makeNumber = (dice: readonly number[], order: (number | null)[]) => {
    return order.map((i) => i !== null ? dice[i] : "_").join("");
  };

  return (
    <div className="diddler">
      <div className="diddler-scores">
        <div className={`diddler-score-item ${state.roundWins[0]! > state.roundWins[1]! ? "leading" : ""}`}>
          <div className="diddler-score-label">You</div>
          <div className="diddler-score-value">{state.roundWins[0]}</div>
        </div>
        <div className="diddler-goal">/ {ROUNDS_TO_WIN} rounds</div>
        <div className={`diddler-score-item ${state.roundWins[1]! > state.roundWins[0]! ? "leading" : ""}`}>
          <div className="diddler-score-label">Bot</div>
          <div className="diddler-score-value">{state.roundWins[1]}</div>
        </div>
      </div>

      {state.winner !== null ? (
        <div className="diddler-winner">{state.winner === 0 ? "You win the match!" : "Bot wins the match!"}</div>
      ) : null}

      {state.phase === "rolling" && (
        <div className="diddler-controls">
          <button data-testid="hint-target-diddler-roll" onClick={() => dispatch({ type: "roll" })}>Roll Dice</button>
        </div>
      )}

      {state.phase === "arranging" && (
        <>
          <div className="diddler-section">
            <div className="diddler-section-label">Your Dice — click to select</div>
            <div className="diddler-dice-row">
              {state.playerDice.map((face, i) => (
                <div
                  key={i}
                  className={`diddler-die${placed.has(i) ? " placed" : selected === i ? " available" : " available"}`}
                  onClick={() => handleDieClick(i)}
                  title={placed.has(i) ? "In a slot — click to remove" : selected === i ? "Selected" : "Click to select"}
                >
                  {DICE_FACES[face] ?? face}
                </div>
              ))}
            </div>
          </div>

          <div className="diddler-section">
            <div className="diddler-section-label">Arrange digits (click a slot to place selected die)</div>
            <div className="diddler-slots-row">
              {slots.map((s, i) => (
                <div
                  key={i}
                  className={`diddler-slot${s !== null ? " filled" : ""}`}
                  onClick={() => handleSlotClick(i)}
                >
                  {s !== null ? (DICE_FACES[state.playerDice[s]!] ?? state.playerDice[s]) : "?"}
                </div>
              ))}
            </div>
            <div className="diddler-number">{makeNumber(state.playerDice, slots)}</div>
          </div>

          <div className="diddler-controls">
            <button data-testid="hint-target-diddler-setOrder" disabled={!allFilled} onClick={submitOrder}>Confirm Number</button>
          </div>
          <div className="diddler-hint">Select a die, then click a slot. Place all 3 to confirm.</div>
        </>
      )}

      {state.phase === "result" && (
        <>
          <div className="diddler-result">{state.roundResult}</div>
          {state.winner === null && (
            <div className="diddler-controls">
              <button data-testid="hint-target-diddler-roll" onClick={() => dispatch({ type: "roll" })}>Next Round</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
