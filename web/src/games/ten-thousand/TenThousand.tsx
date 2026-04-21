import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TenThousandState, TenThousandAction, TenThousandSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { Die } from "../../engines/dice/Die.js";
import "./TenThousand.css";

export function TenThousand({ state, dispatch, onGameOver }: GameProps<TenThousandState, TenThousandSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const [selected, setSelected] = useState<number[]>([]);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  // Reset selected when roll changes
  useEffect(() => {
    setSelected([]);
  }, [state.lastRoll]);

  const phase = state.currentTurn.phase;
  const canRoll = phase === "preRoll";
  const canSetAside = phase === "rolled" && selected.length > 0;
  const canBank = phase === "preRoll" && state.currentTurn.turnScore > 0;

  function toggleSelect(i: number) {
    if (phase !== "rolled") return;
    setSelected((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i],
    );
  }

  const target = parseInt(state.settings.target, 10);

  return (
    <div className="ten-k">
      <div className="ten-k-scores">
        <div>
          <div className="label">You</div>
          <div className="value">{state.bankedScore} / {target}</div>
        </div>
        <div>
          <div className="label">Bot</div>
          <div className="value">{state.botBankedScore} / {target}</div>
        </div>
      </div>

      <div className="ten-k-turn-score">
        Turn score: <strong>{state.currentTurn.turnScore}</strong>
        {state.currentTurn.setAside.length > 0 && (
          <span> (set aside: {state.currentTurn.setAside.join(", ")})</span>
        )}
      </div>

      <div className="ten-k-dice">
        {state.lastRoll.map((die, i) => (
          <Die
            key={i}
            value={die.value}
            kept={selected.includes(i)}
            onClick={() => toggleSelect(i)}
          />
        ))}
      </div>

      {phase === "farkled" && <div className="ten-k-farkle">FARKLE! Turn over.</div>}

      {state.lastBotTurnScore > 0 && (
        <div className="ten-k-bot">Bot banked {state.lastBotTurnScore} last turn</div>
      )}

      <div className="ten-k-controls">
        <button onClick={() => dispatch({ type: "roll" } as TenThousandAction)} disabled={!canRoll || !!terminal}>
          Roll ({state.currentTurn.diceRemaining} dice)
        </button>
        <button
          onClick={() => {
            dispatch({ type: "setAside", indices: selected } as TenThousandAction);
            setSelected([]);
          }}
          disabled={!canSetAside || !!terminal}
        >
          Set Aside
        </button>
        <button onClick={() => dispatch({ type: "bank" } as TenThousandAction)} disabled={!canBank || !!terminal}>
          Bank
        </button>
        {phase === "farkled" && (
          <button onClick={() => dispatch({ type: "nextTurn" } as TenThousandAction)} disabled={!!terminal}>
            Next Turn
          </button>
        )}
      </div>

      {terminal && (
        <div className={`ten-k-game-over ${state.playerWon ? "won" : "lost"}`}>
          {state.playerWon ? "You Win!" : "Bot Wins!"} Final: {state.bankedScore}
        </div>
      )}
    </div>
  );
}
