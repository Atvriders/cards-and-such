import { useEffect, useMemo, useRef, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { StrategoFullState, StrategoFullSettings, StrategoFullAction, Rank, Piece } from "./state.js";
import {
  isTerminal,
  isLake,
  isLegalMove,
  rankLetter,
  rankName,
  STANDARD_COMPOSITION,
  ROWS,
  COLS,
} from "./state.js";
import "./Game.css";

function pieceClass(p: Piece, viewer: 0 = 0): string {
  const showRank = p.side === viewer || p.revealed;
  const cls = ["sf-piece"];
  if (p.side === 0) cls.push("human");
  else cls.push("cpu");
  if (!showRank && p.side !== 0) cls.push("hidden-back");
  if (p.revealed && p.side !== viewer) cls.push("revealed");
  if (p.rank === -1 && showRank) cls.push("bomb");
  if (p.rank === 0 && showRank) cls.push("flag");
  return cls.join(" ");
}

function displayLabel(p: Piece, viewer: 0): string {
  const showRank = p.side === viewer || p.revealed;
  if (!showRank) return "?";
  return rankLetter(p.rank);
}

export function StrategoFullGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<StrategoFullState, StrategoFullSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const endedRef = useRef(false);
  useEffect(() => {
    if (terminal && !endedRef.current) {
      endedRef.current = true;
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  // Setup palette: which rank is selected to place
  const [paletteRank, setPaletteRank] = useState<Rank | null>(null);

  // Count of each rank remaining in setup pile
  const pileCounts = useMemo(() => {
    const counts = new Map<number, number>();
    for (const r of state.setupPile) counts.set(r, (counts.get(r) ?? 0) + 1);
    return counts;
  }, [state.setupPile]);

  function handleCellClick(r: number, c: number): void {
    if (state.phase === "setup") {
      // Place: rows 6..9, empty cell, with paletteRank chosen
      if (r < 6 || r > 9) return;
      if (state.board[r]?.[c]) return;
      if (paletteRank === null) return;
      dispatch({ type: "place", r, c, rank: paletteRank } satisfies StrategoFullAction);
      // If that was the last of this rank, clear palette
      const left = (pileCounts.get(paletteRank) ?? 0) - 1;
      if (left <= 0) setPaletteRank(null);
      return;
    }
    if (state.phase === "playing") {
      dispatch({ type: "select", r, c } satisfies StrategoFullAction);
    }
  }

  // Compute legal targets for currently selected piece (highlight)
  const legalTargets = useMemo(() => {
    const out = new Set<string>();
    if (state.phase !== "playing" || !state.selected) return out;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const ok = isLegalMove(state.board, 0, {
          fromR: state.selected.r, fromC: state.selected.c, toR: r, toC: c,
        });
        if (ok) out.add(`${r},${c}`);
      }
    }
    return out;
  }, [state.phase, state.selected, state.board]);

  let statusText = "";
  let statusClass = "";
  if (state.winner === 0) { statusText = "You captured the flag! Victory."; statusClass = "win"; }
  else if (state.winner === 1) { statusText = "Defeat — the CPU captured your flag."; statusClass = "loss"; }
  else if (state.phase === "setup") {
    statusText = state.setupPile.length === 0
      ? "Army ready. Press Start Game."
      : `Place your army (${40 - state.setupPile.length}/40 placed)`;
  } else if (state.turn === 0) statusText = "Your turn — click a piece, then an empty square.";
  else statusText = "CPU is thinking...";

  let logText = "";
  if (state.lastCombat) {
    const c = state.lastCombat;
    const aName = rankName(c.attackerRank);
    const dName = rankName(c.defenderRank);
    const attackerLbl = c.attackerSide === 0 ? "Your" : "CPU";
    const defenderLbl = c.attackerSide === 0 ? "CPU" : "Your";
    if (c.defenderRank === 0) {
      logText = `${attackerLbl} ${aName} captured the ${defenderLbl} flag!`;
    } else if (c.outcome === "attackerWins") {
      logText = `${attackerLbl} ${aName} defeated ${defenderLbl} ${dName}.`;
    } else if (c.outcome === "defenderWins") {
      logText = `${defenderLbl} ${dName} defeated attacker ${aName}.`;
    } else {
      logText = `${aName} vs ${dName}: both removed.`;
    }
  }

  // Build palette list of ranks present in pile (in standard order, but sort by rank desc for nice display)
  const paletteOrder = STANDARD_COMPOSITION.map((x) => x.rank);

  return (
    <div className="sf-wrap fade-in">
      <div className="sf-header">
        <div className={`sf-status pulse ${statusClass}`} data-testid="stratego-full-status">{statusText}</div>
        <div className="sf-controls">
          {state.phase === "setup" && (
            <>
              <button
                type="button"
                className="sf-btn"
                data-testid="stratego-full-auto-place"
                onClick={() => dispatch({ type: "autoFillSetup" } satisfies StrategoFullAction)}
                disabled={state.setupPile.length === 0}
                title="Randomly fill remaining slots with your unplaced pieces"
              >
                Auto-Place Army
              </button>
              <button
                type="button"
                className="sf-btn primary"
                data-testid="stratego-full-start"
                onClick={() => dispatch({ type: "startGame" } satisfies StrategoFullAction)}
                disabled={state.setupPile.length > 0}
                title="Begin the game (all 40 pieces must be placed first)"
              >
                Start Game
              </button>
            </>
          )}
          <button
            type="button"
            className="sf-btn danger"
            data-testid="stratego-full-new-game"
            onClick={() => dispatch({ type: "newGame" } satisfies StrategoFullAction)}
            title="Reset and start a new game with a fresh CPU setup"
          >
            New Game
          </button>
        </div>
      </div>

      <div className="sf-board-and-side">
        <div className="sf-board" data-testid="stratego-full-board">
          {Array.from({ length: ROWS }).map((_unused, r) =>
            Array.from({ length: COLS }).map((_u, c) => {
              const lake = isLake(r, c);
              const cell = state.board[r]?.[c] ?? null;
              const sel = state.selected && state.selected.r === r && state.selected.c === c;
              const key = `${r},${c}`;
              const isTarget = legalTargets.has(key);
              const isAttack = isTarget && cell !== null && cell.side === 1;
              const classes = ["sf-cell"];
              if ((r + c) % 2 === 1) classes.push("dark");
              if (lake) classes.push("lake");
              if (sel) classes.push("selected");
              if (isTarget && !isAttack) classes.push("legal-target");
              if (isAttack) classes.push("legal-attack");
              return (
                <button
                  type="button"
                  className={classes.join(" ")}
                  key={key}
                  data-testid={`stratego-full-cell-${r}-${c}`}
                  onClick={() => !lake && handleCellClick(r, c)}
                  disabled={lake}
                  title={lake ? "Lake (impassable)" : `Row ${r + 1}, Col ${c + 1}`}
                  aria-label={lake ? "Lake" : `Square row ${r + 1} column ${c + 1}`}
                >
                  {cell && (
                    <div className={pieceClass(cell, 0)} title={cell.side === 0 || cell.revealed ? rankName(cell.rank) : "Enemy piece"}>
                      {displayLabel(cell, 0)}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {state.phase === "setup" && (
          <div className="sf-side">
            <div style={{ fontSize: "0.85rem", opacity: 0.85 }}>
              Pick a rank, then click your half of the board (bottom 4 rows) to place. Or press Auto-Place.
            </div>
            <div className="sf-palette" role="group" aria-label="Piece palette">
              {paletteOrder.map((rk) => {
                const count = pileCounts.get(rk as number) ?? 0;
                const active = paletteRank === rk;
                return (
                  <button
                    type="button"
                    key={rk}
                    className={`sf-palette-btn${active ? " active" : ""}`}
                    onClick={() => setPaletteRank(rk as Rank)}
                    disabled={count === 0}
                    title={`Place a ${rankName(rk as Rank)} (${count} remaining)`}
                    aria-label={`Place ${rankName(rk as Rank)}, ${count} remaining`}
                    data-testid={`stratego-full-palette-${rk}`}
                  >
                    <span>{rankLetter(rk as Rank)}</span>
                    <span className="sf-palette-count">x{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {logText && <div className="sf-log" data-testid="stratego-full-log">{logText}</div>}

      {state.phase === "done" && (
        <div className="sf-done-panel bounce-in" data-testid="stratego-full-done">
          <div className="sf-done-title">{state.winner === 0 ? "You Won!" : "You Lost"}</div>
          <button
            type="button"
            className="sf-btn primary"
            onClick={() => dispatch({ type: "newGame" } satisfies StrategoFullAction)}
            title="Start a brand-new game"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
