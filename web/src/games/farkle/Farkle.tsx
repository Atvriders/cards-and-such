import { useState, useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FarkleState, FarkleAction, FarkleSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { Die } from "../../engines/dice/Die.js";
import { scoreFarkleSelection } from "../../engines/dice/index.js";
import "./Farkle.css";

export function Farkle({
  state,
  dispatch,
  onGameOver,
}: GameProps<FarkleState, FarkleSettings>): JSX.Element {
  const [selected, setSelected] = useState<number[]>([]);
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) {
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  // Clear selection when phase changes
  useEffect(() => {
    setSelected([]);
  }, [state.currentTurn.phase]);

  const { phase, diceRemaining, turnScore } = state.currentTurn;
  const target = parseInt(state.settings.target, 10);

  function toggleSelect(index: number) {
    if (phase !== "rolled") return;
    setSelected((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  }

  function handleSetAside() {
    if (selected.length === 0) return;
    dispatch({ type: "setAside", indices: selected } as FarkleAction);
    setSelected([]);
  }

  function handleRoll() {
    dispatch({ type: "roll" } as FarkleAction);
  }

  function handleBank() {
    dispatch({ type: "bank" } as FarkleAction);
  }

  const selectedValues = selected.map((i) => state.lastRoll[i]?.value).filter(Boolean) as (1|2|3|4|5|6)[];
  const selectionScore = scoreFarkleSelection(selectedValues);
  const selectionValid = selected.length > 0 && selectionScore > 0;

  return (
    <div className="farkle">
      <div className="farkle-scoreboard">
        <span className="farkle-banked">
          Banked: {state.bankedScore}
          <span className="farkle-target"> / {target}</span>
        </span>
        <span className="farkle-turn-score">This Turn: {turnScore}</span>
        <span className="farkle-turns">Turns: {state.turnsTaken}</span>
      </div>

      {phase === "farkled" && (
        <div className="farkle-message">
          FARKLE! No scoring dice — turn score lost!
        </div>
      )}

      {terminal && (
        <div className="farkle-message won">
          You win! Reached {target} in {state.turnsTaken} turn{state.turnsTaken !== 1 ? "s" : ""}!
        </div>
      )}

      {state.currentTurn.setAside.length > 0 && (
        <div>
          <div className="farkle-set-aside-label">Set Aside ({state.currentTurn.setAside.length} dice):</div>
          <div className="farkle-set-aside">
            {state.currentTurn.setAside.map((face, i) => (
              <Die key={i} value={face} kept={true} />
            ))}
          </div>
        </div>
      )}

      {state.lastRoll.length > 0 && phase !== "preRoll" && (
        <div>
          <div className="farkle-set-aside-label">
            Current Roll ({diceRemaining} dice):
            {phase === "rolled" && selected.length > 0 && (
              <span> — Selection: {selectionValid ? `+${selectionScore}` : "invalid"}</span>
            )}
          </div>
          <div className="farkle-dice">
            {state.lastRoll.map((die, i) => (
              <span key={i} data-testid={`hint-target-farkle-die-${i}`}>
                <Die
                  value={die.value}
                  kept={selected.includes(i)}
                  onClick={() => toggleSelect(i)}
                />
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="farkle-controls">
        {phase === "preRoll" && !terminal && (
          <button data-testid="hint-target-farkle-roll" onClick={handleRoll}>
            Roll {diceRemaining} {diceRemaining === 1 ? "Die" : "Dice"}
          </button>
        )}

        {phase === "rolled" && (
          <>
            <button data-testid="hint-target-farkle-setaside" onClick={handleSetAside} disabled={!selectionValid}>
              Set Aside {selectionValid ? `(+${selectionScore})` : ""}
            </button>
          </>
        )}

        {phase === "farkled" && !terminal && (
          <button data-testid="hint-target-farkle-next-turn" onClick={() => dispatch({ type: "nextTurn" } as FarkleAction)}>Next Turn</button>
        )}

        {phase === "preRoll" && turnScore > 0 && !terminal && (
          <button className="bank-btn" data-testid="hint-target-farkle-bank" onClick={handleBank}>
            Bank {turnScore}
          </button>
        )}
      </div>
    </div>
  );
}
