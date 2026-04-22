import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PCState, PrimeClimbSettings, Operation } from "./state.js";
import { reducer, isTerminal } from "./state.js";
import "./PrimeClimb.css";

const OPS: Operation[] = ["+", "-", "*", "/"];
const TARGET = 101;

export function PrimeClimb({ state, dispatch, onGameOver }: GameProps<PCState, PrimeClimbSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const [selectedDie, setSelectedDie] = useState<number | null>(null);
  const [selectedPawn, setSelectedPawn] = useState<0 | 1 | null>(null);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const statusClass = state.winner === "player" ? "win" : state.winner === "bot" ? "loss" : "";

  const usedDice = state.dice.filter((d) => !state.pendingDice.includes(d));
  const pendingSet = [...state.pendingDice];

  function handleDieClick(dieVal: number) {
    if (state.gameOver || state.turn !== "player") return;
    if (!pendingSet.includes(dieVal)) return;
    setSelectedDie(selectedDie === dieVal ? null : dieVal);
  }

  function handlePawnClick(idx: 0 | 1) {
    if (state.gameOver || state.turn !== "player") return;
    setSelectedPawn(selectedPawn === idx ? null : idx);
  }

  function handleOp(op: Operation) {
    if (selectedDie === null || selectedPawn === null) return;
    dispatch({ type: "apply", pawnIdx: selectedPawn, die: selectedDie, op });
    setSelectedDie(null);
    setSelectedPawn(null);
  }

  const canApply = selectedDie !== null && selectedPawn !== null && !state.gameOver;

  return (
    <div className="pc">
      <div className="pc-board">
        <div className="pc-player-side">
          <h3>You</h3>
          <div className="pc-pawns">
            {([0, 1] as const).map((i) => (
              <div key={i} className="pc-pawn" onClick={() => handlePawnClick(i)}>
                <div className={`pc-pawn-circle ${selectedPawn === i ? "selected" : ""} ${state.player[i] === TARGET ? "at-target" : ""}`}>
                  {state.player[i]}
                </div>
                <div className="pc-pawn-label">Pawn {i + 1}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, paddingTop: 32 }}>
          <div style={{ fontSize: "1.5rem", color: "#888" }}>→ 101</div>
        </div>

        <div className="pc-bot-side">
          <h3>Bot</h3>
          <div className="pc-pawns">
            {([0, 1] as const).map((i) => (
              <div key={i} className="pc-pawn">
                <div className={`pc-pawn-circle ${state.bot[i] === TARGET ? "at-target" : ""}`}>
                  {state.bot[i]}
                </div>
                <div className="pc-pawn-label">Pawn {i + 1}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {!state.gameOver && state.pendingDice.length > 0 && (
        <>
          <div className="pc-dice">
            <span>Dice:</span>
            {state.dice.map((d, i) => {
              const isUsed = !pendingSet.includes(d) || (pendingSet.indexOf(d) < 0);
              // Track which dice are pending vs used
              const countInPending = pendingSet.filter((x) => x === d).length;
              const countInDice = state.dice.filter((x) => x === d).length;
              const usedCount = countInDice - countInPending;
              // For display: show used state per die slot
              const dieUsed = i < usedCount;
              return (
                <div
                  key={i}
                  className={`pc-die ${dieUsed ? "used" : ""} ${selectedDie === d && !dieUsed ? "chosen-die" : ""}`}
                  onClick={() => !dieUsed && handleDieClick(d)}
                >
                  {d}
                </div>
              );
            })}
          </div>

          <div className="pc-ops">
            {OPS.map((op) => (
              <button
                key={op}
                className="pc-op-btn"
                disabled={!canApply}
                onClick={() => handleOp(op)}
              >
                {op}
              </button>
            ))}
          </div>
          <div className="pc-hint">
            {selectedPawn === null ? "Click a pawn" : selectedDie === null ? "Click a die" : "Click an operation"}
          </div>
        </>
      )}

      {!state.gameOver && state.pendingDice.length === 0 && state.turn === "player" && (
        <button className="pc-roll-btn" onClick={() => dispatch({ type: "roll" })}>
          Roll Dice
        </button>
      )}

      <div className={`pc-status ${statusClass}`}>{state.message}</div>

      {state.gameOver && (
        <button className="pc-restart" onClick={() => dispatch({ type: "restart" })}>
          Play Again
        </button>
      )}
    </div>
  );
}
