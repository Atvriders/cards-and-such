import { useEffect, useRef, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ParcheesiFullState, ParcheesiFullSettings, ParcheesiFullAction } from "./state.js";
import {
  isTerminal,
  canMoveSteps,
  availableDieValues,
  hasAnyLegalMove,
  HOME,
  HOME_COL_START,
  NUM_PAWNS,
  NUM_PLAYERS,
  TRACK_SIZE,
  YARD,
} from "./state.js";
import "./Game.css";

const COLORS = ["blue", "red", "green", "orange"];
const LABELS = ["You", "CPU 1", "CPU 2", "CPU 3"];

export function ParcheesiFullGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<ParcheesiFullState, ParcheesiFullSettings>): JSX.Element {
  // Guarded onGameOver wiring.
  const endedRef = useRef(false);
  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [state, onGameOver]);

  // Selected die for the human's next move click.
  const [selectedDie, setSelectedDie] = useState<number | null>(null);

  // Re-clamp selectedDie when state changes (e.g. after consume).
  useEffect(() => {
    if (selectedDie === null) return;
    const opts = availableDieValues(state);
    if (!opts.some((o) => o.index === selectedDie)) setSelectedDie(null);
  }, [state, selectedDie]);

  const terminal = isTerminal(state);
  const isMyTurn = state.turn === 0 && state.winner === null && state.phase !== "ended";
  const canRoll = isMyTurn && state.phase === "rolling";
  const inMoving = isMyTurn && state.phase === "moving";

  function chooseDie(idx: number) {
    setSelectedDie(idx);
  }

  function movePawn(pawnIdx: number) {
    if (selectedDie === null) return;
    dispatch({ type: "move", pawn: pawnIdx, dieIndex: selectedDie } satisfies ParcheesiFullAction);
  }

  function rollDice() {
    dispatch({ type: "roll" } satisfies ParcheesiFullAction);
  }

  function passTurn() {
    dispatch({ type: "pass" } satisfies ParcheesiFullAction);
  }

  // Compute available die value for the currently selected die.
  let selectedVal: number | null = null;
  if (selectedDie !== null) {
    const opt = availableDieValues(state).find((o) => o.index === selectedDie);
    if (opt) selectedVal = opt.value;
  }

  // For each human pawn, can it be moved by the currently selected die?
  function canMoveWithSelected(pawnIdx: number): boolean {
    if (!inMoving || selectedVal == null) return false;
    return canMoveSteps(state.pawns, 0, pawnIdx, selectedVal);
  }

  // Render a single pawn label.
  function pawnPosLabel(rel: number): string {
    if (rel === YARD) return "Yard";
    if (rel === HOME) return "Home";
    if (rel >= HOME_COL_START) return `Home col ${rel - HOME_COL_START + 1}/7`;
    return `Sq ${rel}`;
  }

  const movesLeft = hasAnyLegalMove(state, state.turn);
  const showPass = inMoving && !movesLeft;

  let banner = state.lastEvent;
  if (terminal) {
    banner = state.winner === 0 ? "You win! All pawns home." : `${LABELS[state.winner!]} wins.`;
  }

  return (
    <div className="parcheesi-full fade-in">
      <div
        className={`pf-status ${terminal ? (state.winner === 0 ? "win" : "loss") : ""}`}
        data-testid="status-readout"
      >
        {banner}
      </div>

      <div className="pf-dice-row">
        {state.dice.map((d, i) => {
          if (d == null) return (
            <div key={`d${i}`} className="pf-die used" aria-label={`Die ${i + 1} used`}>—</div>
          );
          const sel = selectedDie === i;
          return (
            <button
              key={`d${i}`}
              type="button"
              className={`pf-die ${sel ? "selected" : ""}`}
              onClick={() => chooseDie(i)}
              disabled={!inMoving}
              title={`Select die showing ${d}`}
              aria-label={`Die ${i + 1}: ${d}${sel ? " (selected)" : ""}`}
              data-testid={`die-${i}`}
            >
              {d}
            </button>
          );
        })}
        {state.bonuses.map((b, i) => {
          const idx = -1 - i;
          const sel = selectedDie === idx;
          return (
            <button
              key={`b${i}`}
              type="button"
              className={`pf-die bonus ${sel ? "selected" : ""}`}
              onClick={() => chooseDie(idx)}
              disabled={!inMoving}
              title={`Bonus +${b}`}
              aria-label={`Bonus ${b}${sel ? " (selected)" : ""}`}
              data-testid={`bonus-${i}`}
            >
              +{b}
            </button>
          );
        })}
        {canRoll && (
          <button
            type="button"
            className="pf-roll-btn"
            onClick={rollDice}
            data-testid="roll-btn"
            title="Roll both dice"
          >
            Roll Dice
          </button>
        )}
        {showPass && (
          <button
            type="button"
            className="pf-pass-btn"
            onClick={passTurn}
            data-testid="pass-btn"
            title="Pass — no legal moves"
          >
            Pass
          </button>
        )}
      </div>

      <div className="pf-players">
        {Array.from({ length: NUM_PLAYERS }, (_, pi) => (
          <div
            key={pi}
            className={`pf-player color-${COLORS[pi]} ${state.turn === pi && !terminal ? "active" : ""}`}
            data-testid={`player-${pi}`}
          >
            <div className="pf-player-label">{LABELS[pi]}</div>
            <div className="pf-pawn-grid">
              {state.pawns[pi]!.map((pos, pawnIdx) => {
                const isHuman = pi === 0;
                const moveable = isHuman && canMoveWithSelected(pawnIdx);
                return (
                  <div key={pawnIdx} className="pf-pawn-row">
                    <span
                      className={`pf-pawn color-${COLORS[pi]} ${pos === HOME ? "finished" : ""}`}
                      aria-label={`${LABELS[pi]} pawn ${pawnIdx + 1}`}
                    >
                      {pawnIdx + 1}
                    </span>
                    <span className="pf-pawn-pos">{pawnPosLabel(pos)}</span>
                    {moveable && (
                      <button
                        type="button"
                        className="pf-move-btn"
                        onClick={() => movePawn(pawnIdx)}
                        title={`Move pawn ${pawnIdx + 1} by ${selectedVal}`}
                        data-testid="move-btn"
                      >
                        Move +{selectedVal}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {terminal && (
        <div className={`pf-end bounce-in ${state.winner === 0 ? "win" : "loss"}`} data-testid="end-panel">
          <div className="pf-end-title">
            {state.winner === 0 ? "Victory!" : `${LABELS[state.winner!]} wins`}
          </div>
          <div className="pf-end-score pulse">Score: {terminal.score}</div>
        </div>
      )}

      <div className="pf-legend">
        Track: {TRACK_SIZE} outer squares + 7-square home column. Need a 5 to leave the yard.
        Doubles = extra turn. Captures = +20 bonus. Pawn home = +10 bonus.
        Pawns: {NUM_PAWNS} per player.
      </div>
    </div>
  );
}
