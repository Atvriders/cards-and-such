import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MancalaFullKalahState, MancalaFullKalahSettings, MancalaFullKalahAction } from "./state.js";
import { P0_PITS, P1_PITS, P0_STORE, P1_STORE, isTerminal } from "./state.js";
import "./Game.css";

export function MancalaFullKalahGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<MancalaFullKalahState, MancalaFullKalahSettings>): JSX.Element {
  const endedRef = useRef(false);
  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [state, onGameOver]);

  const matchOver = state.matchWinner !== null;
  const roundOver = state.roundWinner !== null;
  const isMyTurn = state.turn === 0 && !roundOver && !matchOver;

  let statusText = "";
  let statusClass = "";
  if (matchOver) {
    if (state.matchWinner === 0) { statusText = "Match win!"; statusClass = "win"; }
    else if (state.matchWinner === 1) { statusText = "CPU wins the match."; statusClass = "loss"; }
    else { statusText = "Match drawn."; }
  } else if (roundOver) {
    if (state.roundWinner === 0) { statusText = `Round to you (${state.matchScore.p0}-${state.matchScore.p1}).`; statusClass = "win"; }
    else if (state.roundWinner === 1) { statusText = `Round to CPU (${state.matchScore.p0}-${state.matchScore.p1}).`; statusClass = "loss"; }
    else { statusText = `Round drawn (${state.matchScore.p0}-${state.matchScore.p1}).`; }
  } else if (!isMyTurn) {
    statusText = "CPU is thinking…";
  } else {
    statusText = "Your turn — pick a pit to sow CCW.";
  }

  function handleClick(pit: number): void {
    if (!isMyTurn || state.board[pit] === 0) return;
    dispatch({ type: "sow", pit } satisfies MancalaFullKalahAction);
  }

  function handleNextRound(): void {
    if (!roundOver || matchOver) return;
    dispatch({ type: "nextRound" } satisfies MancalaFullKalahAction);
  }

  // Render top row (CPU) right-to-left so sowing direction reads left-to-right
  // around the board the way the rulebook describes.
  const cpuRow = [...P1_PITS].reverse();

  return (
    <div className="mfk fade-in">
      <div className={`mfk-status ${statusClass}`}>{statusText}</div>

      <div className="mfk-match pulse">
        <span className="mfk-match-label">Best of 9</span>
        <span className="mfk-match-score" data-testid="match-score">
          You {state.matchScore.p0} – {state.matchScore.p1} CPU
        </span>
        <span className="mfk-match-rounds">
          Round {Math.min(state.roundsPlayed + (roundOver ? 0 : 1), 9)} / 9
        </span>
      </div>

      <div className="mfk-board">
        <div
          className={`mfk-store cpu-store${state.roundWinner === 1 ? " hot" : ""}`}
          data-testid="store-13"
          title="CPU home pit (kalah)"
        >
          <div className="mfk-store-label">CPU</div>
          <div className="mfk-store-count">{state.board[P1_STORE]}</div>
        </div>
        <div className="mfk-pits">
          <div className="mfk-row">
            {cpuRow.map((pit) => (
              <button
                key={pit}
                className={`mfk-pit cpu-pit${state.board[pit] === 0 ? " empty" : ""}${state.lastMove === pit ? " just-moved" : ""}${state.lastCapturePit !== null && (12 - pit) === state.lastCapturePit ? " captured" : ""}`}
                disabled
                data-testid={`pit-${pit}`}
                title={`CPU pit (${state.board[pit]} seeds)`}
                aria-label={`CPU pit with ${state.board[pit]} seeds`}
              >
                {state.board[pit]}
              </button>
            ))}
          </div>
          <div className="mfk-row">
            {P0_PITS.map((pit) => (
              <button
                key={pit}
                className={`mfk-pit you-pit${state.board[pit] === 0 ? " empty" : isMyTurn ? " active" : ""}${state.lastMove === pit ? " just-moved" : ""}${state.lastCapturePit === pit ? " captured" : ""}`}
                onClick={() => handleClick(pit)}
                disabled={!isMyTurn || state.board[pit] === 0}
                data-testid={`pit-${pit}`}
                title={`Your pit (${state.board[pit]} seeds) — sow CCW`}
                aria-label={`Your pit with ${state.board[pit]} seeds. Sow counter-clockwise.`}
              >
                {state.board[pit]}
              </button>
            ))}
          </div>
        </div>
        <div
          className={`mfk-store you-store${state.roundWinner === 0 ? " hot" : ""}`}
          data-testid="store-6"
          title="Your home pit (kalah)"
        >
          <div className="mfk-store-label">You</div>
          <div className="mfk-store-count">{state.board[P0_STORE]}</div>
        </div>
      </div>

      {roundOver && !matchOver && (
        <div className="mfk-panel bounce-in">
          <div className="mfk-panel-msg">
            {state.roundWinner === 0 && "Nice round!"}
            {state.roundWinner === 1 && "CPU took that one."}
            {state.roundWinner === "draw" && "Even split — nothing scored."}
          </div>
          <button
            type="button"
            className="mfk-next"
            onClick={handleNextRound}
            data-testid="next-round"
            title="Start the next round of the match"
          >
            Next round
          </button>
        </div>
      )}

      {matchOver && (
        <div className="mfk-panel bounce-in" data-testid="match-over">
          <div className="mfk-panel-msg">
            {state.matchWinner === 0 && `You won the match ${state.matchScore.p0}–${state.matchScore.p1}!`}
            {state.matchWinner === 1 && `CPU won the match ${state.matchScore.p1}–${state.matchScore.p0}.`}
            {state.matchWinner === "draw" && "Match ended in a draw."}
          </div>
        </div>
      )}
    </div>
  );
}
