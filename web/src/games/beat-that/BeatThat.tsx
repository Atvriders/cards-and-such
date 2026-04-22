import { useState, useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BeatThatState, BeatThatAction, BeatThatSettings, DieFace } from "./state.js";
import { isTerminal } from "./state.js";
import "./BeatThat.css";

export function BeatThat({
  state,
  dispatch,
  onGameOver,
}: GameProps<BeatThatState, BeatThatSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const [arrangement, setArrangement] = useState<Array<DieFace | null>>([]);
  const [remaining, setRemaining] = useState<DieFace[]>([]);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  useEffect(() => {
    if (state.phase === "playerArrange" && state.playerDice.length > 0) {
      setArrangement(Array(state.numDice).fill(null));
      setRemaining([...state.playerDice]);
    } else {
      setArrangement([]);
      setRemaining([]);
    }
  }, [state.phase, state.numDice, state.playerDice]);

  const { phase, playerDice, playerNumber, playerWins, botWins, botDice, botNumber, totalRounds, currentRound, message, winner, roundMessage } = state;

  function handleDieClick(dieVal: DieFace, remainIdx: number) {
    // Find first empty slot
    const slotIdx = arrangement.indexOf(null);
    if (slotIdx === -1) return;
    const newArr = [...arrangement];
    newArr[slotIdx] = dieVal;
    const newRemaining = remaining.filter((_, i) => i !== remainIdx);
    setArrangement(newArr);
    setRemaining(newRemaining);
  }

  function handleSlotClick(slotIdx: number) {
    const val = arrangement[slotIdx];
    if (val === null || val === undefined) return;
    const newArr = [...arrangement];
    newArr[slotIdx] = null;
    setArrangement(newArr);
    setRemaining([...remaining, val as DieFace]);
  }

  function handleSubmit() {
    if (arrangement.some((v) => v === null)) return;
    dispatch({ type: "arrange", order: arrangement as DieFace[] } as BeatThatAction);
  }

  const allFilled = arrangement.length > 0 && arrangement.every((v) => v !== null);
  const arrangementNumber = allFilled
    ? parseInt(arrangement.join(""), 10)
    : null;

  return (
    <div className="beat-that">
      <div className="beat-that-scoreboard">
        <span className="beat-that-player-wins">You: {playerWins} wins</span>
        <span className="beat-that-bot-wins">Bot: {botWins} wins</span>
      </div>
      <div className="beat-that-round-label">
        Round {currentRound} of {totalRounds}
      </div>

      {phase === "playerArrange" && (
        <div className="beat-that-dice-area">
          <div style={{ fontSize: "0.85rem", color: "#666" }}>
            Your dice — click to place into arrangement:
          </div>
          <div className="beat-that-dice-row">
            {remaining.map((v, i) => (
              <div
                key={i}
                className="beat-that-die clickable"
                onClick={() => handleDieClick(v, i)}
              >
                {v}
              </div>
            ))}
          </div>

          <div className="beat-that-arrangement-area">
            <div className="beat-that-arrangement-label">
              Your number: {arrangementNumber ?? "—"}
            </div>
            <div className="beat-that-arrangement-slots">
              {arrangement.map((v, i) => (
                <div
                  key={i}
                  className={`beat-that-slot${v !== null ? " filled" : ""}`}
                  onClick={() => handleSlotClick(i)}
                >
                  {v ?? ""}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {(phase === "roundOver" || phase === "gameOver" || phase === "botResult") && (
        <div className="beat-that-round-result">
          <div>You: <strong>{playerNumber}</strong> | Bot: <strong>{botNumber}</strong></div>
          <div>
            Bot's dice: [{botDice.join(", ")}]
          </div>
          <div className={playerNumber > botNumber ? "winner" : "loser"}>
            {roundMessage}
          </div>
        </div>
      )}

      {phase === "playerRoll" && !winner && playerDice.length === 0 && (
        <div className="beat-that-dice-area" style={{ minHeight: 60 }} />
      )}

      <div className="beat-that-controls">
        {phase === "playerRoll" && (
          <button onClick={() => dispatch({ type: "roll" } as BeatThatAction)}>
            Roll Dice
          </button>
        )}
        {phase === "playerArrange" && (
          <button
            className="submit-btn"
            disabled={!allFilled}
            onClick={handleSubmit}
          >
            Submit {arrangementNumber ?? ""}
          </button>
        )}
        {phase === "roundOver" && (
          <button onClick={() => dispatch({ type: "nextRound" } as BeatThatAction)}>
            Next Round
          </button>
        )}
      </div>

      <div
        className={`beat-that-message${winner === "player" ? " win" : winner === "bot" ? " lose" : ""}`}
      >
        {message}
      </div>
    </div>
  );
}
