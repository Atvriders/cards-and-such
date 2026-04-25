import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GearPuzzleState, GearPuzzleSettings, GearPuzzleAction, GearSize } from "./state.js";
import { isTerminal, isChainConnected } from "./state.js";
import "./GearPuzzle.css";

export function GearPuzzle({
  state,
  dispatch,
  onGameOver,
}: GameProps<GearPuzzleState, GearPuzzleSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  // Determine which slots are in the connected chain
  const connectedSlots = new Set<number>();
  if (state.won) {
    state.slots.forEach((_, i) => {
      if (state.slots[i]?.gear !== null) connectedSlots.add(i);
    });
  }

  function handleSlotClick(i: number) {
    if (state.won) return;
    const slot = state.slots[i]!;
    if (slot.fixed) return;
    if (slot.gear !== null) {
      dispatch({ type: "removeGear", slotIndex: i } as GearPuzzleAction);
    } else {
      dispatch({ type: "placeGear", slotIndex: i } as GearPuzzleAction);
    }
  }

  const usedSmall = state.slots.filter(s => !s.fixed && s.gear === "small").length;
  const usedLarge = state.slots.filter(s => !s.fixed && s.gear === "large").length;
  const totalSmall = state.availableGears.filter(g => g === "small").length;
  const totalLarge = state.availableGears.filter(g => g === "large").length;

  return (
    <div className="gear-puzzle">
      <div className="gear-puzzle-info">
        <span>Moves: {state.moves}</span>
        <span>Connect input ⚙ to output ⚙</span>
      </div>

      <div className={`gear-puzzle-status${state.won ? " win" : ""}`}>
        {state.won ? "Gears connected! Power flows through!" : "Place gears to form a chain from input to output"}
      </div>

      <div className="gear-toolbar">
        <span>Select gear:</span>
        {totalSmall > 0 && (
          <button
            className={`gear-tool-btn${state.selectedGear === "small" ? " active" : ""}`}
            onClick={() => dispatch({ type: "selectGear", gear: "small" as GearSize } as GearPuzzleAction)}
          >
            ⚙ Small ({usedSmall}/{totalSmall})
          </button>
        )}
        {totalLarge > 0 && (
          <button
            className={`gear-tool-btn${state.selectedGear === "large" ? " active" : ""}`}
            onClick={() => dispatch({ type: "selectGear", gear: "large" as GearSize } as GearPuzzleAction)}
          >
            ⚙ Large ({usedLarge}/{totalLarge})
          </button>
        )}
      </div>

      <div
        className="gear-grid"
        style={{ gridTemplateColumns: `repeat(${state.cols}, 64px)` }}
      >
        {state.slots.map((slot, i) => {
          const isInput = i === state.inputSlot;
          const isOutput = i === state.outputSlot;
          const isConnected = connectedSlots.has(i);
          return (
            <div
              key={i}
              className={`gear-slot
                ${isInput ? "input-slot" : ""}
                ${isOutput ? "output-slot" : ""}
                ${slot.gear !== null ? "has-gear" : ""}
                ${slot.fixed ? "fixed" : ""}
                ${isConnected ? "connected" : ""}
                ${slot.gear === "large" ? "large-gear" : ""}
                ${slot.gear === "small" ? "small-gear" : ""}
              `}
              onClick={() => handleSlotClick(i)}
              title={isInput ? "Input" : isOutput ? "Output" : slot.gear ? `${slot.gear} gear` : "empty"}
            >
              {slot.gear ? "⚙" : isInput ? "▶" : isOutput ? "★" : ""}
            </div>
          );
        })}
      </div>
    </div>
  );
}
