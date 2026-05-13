import { useEffect, useRef, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ScrabbleState, ScrabbleAction, ScrabbleSettings, Tile } from "./state.js";
import { isTerminal, BOARD_SIZE, PREMIUM_GRID, LETTER_VALUES, CENTER } from "./state.js";
import "./Game.css";

function premiumLabel(p: string | null): string {
  if (p === "tw") return "TW";
  if (p === "dw") return "DW";
  if (p === "tl") return "TL";
  if (p === "dl") return "DL";
  return "";
}

function premiumClass(p: string | null): string {
  if (!p) return "";
  return `sf-prem-${p}`;
}

function tilePoints(t: Tile): number {
  if (t.isBlank) return 0;
  return LETTER_VALUES[t.letter] ?? 0;
}

export function ScrabbleFullGame({ state, dispatch, onGameOver }: GameProps<ScrabbleState, ScrabbleSettings>): JSX.Element {
  const endedRef = useRef(false);
  const [blankPickerAt, setBlankPickerAt] = useState<{ r: number; c: number } | null>(null);

  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [state, onGameOver]);

  // Trigger CPU turn after the human ends their move
  useEffect(() => {
    if (state.turn === "cpu" && state.phase === "playing") {
      const id = window.setTimeout(() => dispatch({ type: "cpuTurn" } as ScrabbleAction), 450);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [state.turn, state.phase, dispatch]);

  const terminal = isTerminal(state);
  const isFirstMove = state.board.every((row) => row.every((c) => c === null));

  function handleCellClick(r: number, c: number) {
    // If clicking a pending tile, recall it
    const pending = state.pending.find((p) => p.r === r && p.c === c);
    if (pending) {
      if (pending.tile.isBlank) {
        // Open blank picker if user wants to change
        setBlankPickerAt({ r, c });
        return;
      }
      dispatch({ type: "recallTile", r, c } as ScrabbleAction);
      return;
    }
    if (state.board[r]![c]) return;
    if (state.turn !== "human") return;
    if (state.selectedRackIdx === null) return;
    const tile = state.humanRack[state.selectedRackIdx];
    if (!tile) return;
    dispatch({ type: "placeTile", r, c } as ScrabbleAction);
    if (tile.isBlank) {
      setBlankPickerAt({ r, c });
    }
  }

  function handleBlankPick(letter: string) {
    if (!blankPickerAt) return;
    dispatch({ type: "setBlank", r: blankPickerAt.r, c: blankPickerAt.c, letter } as ScrabbleAction);
    setBlankPickerAt(null);
  }

  return (
    <div className="sf-wrap fade-in" data-testid="scrabble-full-root">
      <div className="sf-header">
        <div className={`sf-score-block ${state.turn === "human" && state.phase === "playing" ? "sf-active" : ""}`}>
          <div className="sf-score-label">You</div>
          <div className="sf-score-val pulse" data-testid="scrabble-full-human-score">{state.humanScore}</div>
        </div>
        <div className="sf-meta">
          <div className="sf-tiles-left">Bag: {state.bag.length}</div>
          <div className="sf-turn">{terminal ? "Game over" : state.turn === "human" ? "Your turn" : "CPU thinking..."}</div>
        </div>
        <div className={`sf-score-block ${state.turn === "cpu" && state.phase === "playing" ? "sf-active" : ""}`}>
          <div className="sf-score-label">CPU</div>
          <div className="sf-score-val" data-testid="scrabble-full-cpu-score">{state.cpuScore}</div>
        </div>
      </div>

      {state.lastMessage && (
        <div className="sf-message" data-testid="scrabble-full-message">{state.lastMessage}</div>
      )}

      <div className="sf-board" data-testid="scrabble-full-board">
        {state.board.map((row, r) =>
          row.map((cell, c) => {
            const pending = state.pending.find((p) => p.r === r && p.c === c);
            const display = cell ?? pending?.tile ?? null;
            const prem = PREMIUM_GRID[r]![c] ?? null;
            const center = r === CENTER && c === CENTER;
            let cls = "sf-cell";
            if (prem) cls += ` ${premiumClass(prem)}`;
            if (display) cls += " sf-has-tile";
            if (pending) cls += " sf-pending";
            if (cell) cls += " sf-locked";
            if (center && !display) cls += " sf-center";
            return (
              <button
                key={`${r}-${c}`}
                type="button"
                className={cls}
                onClick={() => handleCellClick(r, c)}
                disabled={state.phase === "done" || (state.turn !== "human" && !pending)}
                title={
                  display
                    ? `${display.letter.toUpperCase()}${display.isBlank ? " (blank)" : ""}`
                    : prem
                    ? `${premiumLabel(prem)} square`
                    : `Row ${r + 1}, Col ${c + 1}`
                }
                data-testid={`scrabble-full-cell-${r}-${c}`}
              >
                {display ? (
                  <span className="sf-letter">
                    <span className="sf-letter-ch">{display.letter.toUpperCase()}</span>
                    <span className="sf-letter-pt">{tilePoints(display)}</span>
                  </span>
                ) : center ? (
                  <span className="sf-center-star">*</span>
                ) : (
                  <span className="sf-prem-label">{premiumLabel(prem)}</span>
                )}
              </button>
            );
          }),
        )}
      </div>

      <div className="sf-rack" data-testid="scrabble-full-rack">
        {state.humanRack.map((tile, i) => {
          const used = state.pending.some((p) => p.rackIdx === i);
          const selected = state.selectedRackIdx === i;
          return (
            <button
              key={i}
              type="button"
              className={`sf-tile ${used ? "sf-used" : ""} ${selected ? "sf-selected" : ""}`}
              onClick={() => dispatch({ type: "selectRack", idx: i } as ScrabbleAction)}
              disabled={used || state.turn !== "human" || state.phase === "done"}
              title={tile.isBlank ? "Blank tile (choose letter on place)" : `Tile ${tile.letter.toUpperCase()}`}
              data-testid={`scrabble-full-rack-${i}`}
            >
              <span className="sf-tile-ch">{tile.isBlank ? "?" : tile.letter.toUpperCase()}</span>
              <span className="sf-tile-pt">{tile.isBlank ? 0 : (LETTER_VALUES[tile.letter] ?? 0)}</span>
            </button>
          );
        })}
      </div>

      <div className="sf-actions">
        <button
          type="button"
          className="sf-btn sf-submit"
          disabled={state.pending.length === 0 || state.turn !== "human" || state.phase === "done"}
          onClick={() => dispatch({ type: "submit" } as ScrabbleAction)}
          title="Submit your placed tiles as a word"
          data-testid="scrabble-full-submit"
        >
          Submit Word{isFirstMove ? " (covers center)" : ""}
        </button>
        <button
          type="button"
          className="sf-btn sf-recall"
          disabled={state.pending.length === 0 || state.turn !== "human" || state.phase === "done"}
          onClick={() => dispatch({ type: "recallAll" } as ScrabbleAction)}
          title="Return all placed tiles to your rack"
          data-testid="scrabble-full-recall"
        >
          Recall
        </button>
        <button
          type="button"
          className="sf-btn sf-pass"
          disabled={state.turn !== "human" || state.phase === "done"}
          onClick={() => dispatch({ type: "pass" } as ScrabbleAction)}
          title="Skip your turn — no points scored"
          data-testid="scrabble-full-pass"
        >
          Pass
        </button>
        <button
          type="button"
          className="sf-btn sf-exchange"
          disabled={state.turn !== "human" || state.phase === "done" || state.bag.length < 1}
          onClick={() => {
            // Quick exchange: swap all unused rack tiles
            const idxs = state.humanRack.map((_, i) => i).filter((i) => !state.pending.some((p) => p.rackIdx === i));
            if (idxs.length === 0) return;
            dispatch({ type: "exchange", idxs } as ScrabbleAction);
          }}
          title="Exchange all unselected rack tiles for new ones from the bag"
          data-testid="scrabble-full-exchange"
        >
          Exchange All
        </button>
      </div>

      {blankPickerAt && (
        <div className="sf-blank-picker bounce-in" role="dialog" aria-label="Choose letter for blank">
          <div className="sf-blank-title">Choose a letter for the blank:</div>
          <div className="sf-blank-grid">
            {"abcdefghijklmnopqrstuvwxyz".split("").map((l) => (
              <button
                key={l}
                type="button"
                className="sf-blank-key"
                onClick={() => handleBlankPick(l)}
                title={`Use letter ${l.toUpperCase()}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {terminal && (
        <div className="sf-done bounce-in" data-testid="scrabble-full-done">
          <h2>{state.humanScore > state.cpuScore ? "You win!" : state.humanScore < state.cpuScore ? "CPU wins" : "Tie"}</h2>
          <p>Final: You {state.humanScore} - {state.cpuScore} CPU</p>
          {state.winnerNote && <p className="sf-winner-note">{state.winnerNote}</p>}
        </div>
      )}
    </div>
  );
}
