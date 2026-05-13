import { useEffect, useMemo, useRef, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MatchState, MatchAction, BackgammonMatchSettings } from "./state.js";
import { isTerminal, listMoves, pipCount, POINTS } from "./state.js";
import "./Game.css";

/**
 * BackgammonFullMatchGame
 *
 * Renders the 24-point board horizontally (top row: points 13..24, bottom
 * row: points 12..1) so the user looks at the board the same way a real
 * board sits in front of them. The user (red) bears off at the bottom-
 * right corner; the CPU (dark) bears off at the top-right.
 */
export function BackgammonFullMatchGame(
  { state, dispatch, onGameOver }: GameProps<MatchState, BackgammonMatchSettings>,
): JSX.Element {
  const endedRef = useRef(false);
  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [state, onGameOver]);

  const [selectedFrom, setSelectedFrom] = useState<number | null>(null);

  const myPip = useMemo(() => pipCount(state.board, "P"), [state.board]);
  const oppPip = useMemo(() => pipCount(state.board, "C"), [state.board]);

  const legalMoves = useMemo(
    () => (state.phase === "moving" && state.turn === "P"
      ? listMoves(state.board, "P", state.diceRemaining)
      : []),
    [state.board, state.diceRemaining, state.phase, state.turn],
  );

  /** When user clicks a point/bar: if a die is selected for it, dispatch. */
  function handleClickPoint(idx: number): void {
    if (state.turn !== "P" || state.phase !== "moving") return;
    // If a "from" is already armed, treat this click as the from index for
    // a particular die. We try each remaining die in order, smallest first.
    if (selectedFrom === idx) { setSelectedFrom(null); return; }
    setSelectedFrom(idx);
  }

  function dispatchMove(from: number, die: number): void {
    dispatch({ type: "move", from, dieValue: die } as MatchAction);
    setSelectedFrom(null);
  }

  function legalDiceFrom(from: number): number[] {
    const dice = new Set<number>();
    for (const m of legalMoves) if (m.from === from) dice.add(m.die);
    return Array.from(dice).sort((a, b) => a - b);
  }

  const isMatchOver = state.phase === "matchOver";
  const isGameOver = state.phase === "gameOver";

  /** Render a single point column with its stack of checkers. */
  function PointCol(props: { idx: number; orientation: "top" | "bottom" }): JSX.Element {
    const { idx, orientation } = props;
    const v = state.board.points[idx]!;
    const count = Math.abs(v);
    const side: "P" | "C" | null = v > 0 ? "P" : v < 0 ? "C" : null;
    const checkers = [] as JSX.Element[];
    for (let i = 0; i < Math.min(count, 7); i++) {
      checkers.push(
        <span key={i} className={`bg-checker ${side === "P" ? "p" : "c"}`}>
          {i === 6 && count > 7 ? count : ""}
        </span>,
      );
    }
    const selectable = legalMoves.some((m) => m.from === idx);
    const isSelected = selectedFrom === idx;
    return (
      <button
        type="button"
        className={`bg-point ${orientation} ${idx % 2 === 0 ? "even" : "odd"} ${selectable ? "selectable" : ""} ${isSelected ? "selected" : ""}`}
        onClick={() => handleClickPoint(idx)}
        title={`Point ${idx + 1}${count ? ` — ${count} ${side === "P" ? "your" : "CPU"} checker${count === 1 ? "" : "s"}` : ""}`}
        aria-label={`Point ${idx + 1}`}
        data-testid={`bg-point-${idx}`}
      >
        <span className="bg-point-num">{idx + 1}</span>
        <span className="bg-stack">{checkers}</span>
      </button>
    );
  }

  // Top row shows points 13..24 (indices 12..23) left-to-right
  const topIndices = Array.from({ length: 12 }, (_, i) => 12 + i);
  // Bottom row shows points 12..1 (indices 11..0) left-to-right
  const bottomIndices = Array.from({ length: 12 }, (_, i) => 11 - i);

  return (
    <div className="bg-wrap fade-in">
      <div className="bg-scorebar">
        <div className="bg-score pulse">
          <span className="bg-score-label">You</span>
          <span className="bg-score-num">{state.scoreP}</span>
        </div>
        <div className="bg-target">
          <span>Match to {state.target}</span>
          {state.crawford && <span className="bg-crawford">Crawford</span>}
          {state.crawfordDone && !state.crawford && <span className="bg-postcrawford">Post-Crawford</span>}
        </div>
        <div className="bg-score">
          <span className="bg-score-label">CPU</span>
          <span className="bg-score-num">{state.scoreC}</span>
        </div>
      </div>

      <div className="bg-info-row">
        <div className="bg-pip">Your pip: {myPip}</div>
        <div className={`bg-cube cube-${state.cubeValue}`}>
          <span className="bg-cube-label">Cube</span>
          <span className="bg-cube-val">{state.cubeValue}</span>
          <span className="bg-cube-owner">{state.cubeOwner === null ? "Centered" : state.cubeOwner === "P" ? "You" : "CPU"}</span>
        </div>
        <div className="bg-pip">CPU pip: {oppPip}</div>
      </div>

      <div className="bg-board" role="grid" aria-label="Backgammon board">
        <div className="bg-row top">
          <div className="bg-bar" title="Bar (CPU)">
            <span className="bg-bar-label">Bar</span>
            {state.board.barC > 0 && <span className="bg-bar-count c">{state.board.barC}</span>}
          </div>
          {topIndices.map((i) => <PointCol key={i} idx={i} orientation="top" />)}
          <div className="bg-off" title="CPU bear-off tray">
            <span className="bg-off-label">Off</span>
            <span className="bg-off-count c">{state.board.offC}</span>
          </div>
        </div>
        <div className="bg-row bottom">
          <div
            className={`bg-bar player ${state.board.barP > 0 && legalMoves.some(m => m.from === -1) ? "selectable" : ""} ${selectedFrom === -1 ? "selected" : ""}`}
            title="Bar (you)"
            onClick={() => (state.board.barP > 0 && legalMoves.some(m => m.from === -1) ? setSelectedFrom(selectedFrom === -1 ? null : -1) : undefined)}
            role="button"
            aria-label="Your bar"
            data-testid="bg-bar-player"
          >
            <span className="bg-bar-label">Bar</span>
            {state.board.barP > 0 && <span className="bg-bar-count p">{state.board.barP}</span>}
          </div>
          {bottomIndices.map((i) => <PointCol key={i} idx={i} orientation="bottom" />)}
          <div className="bg-off home" title="Your bear-off tray">
            <span className="bg-off-label">Off</span>
            <span className="bg-off-count p">{state.board.offP}</span>
          </div>
        </div>
      </div>

      <div className="bg-action-row">
        <div className="bg-dice">
          <span className={`bg-die ${state.diceShown[0] === 0 ? "empty" : ""}`} data-testid="bg-die-0">{state.diceShown[0] || "·"}</span>
          <span className={`bg-die ${state.diceShown[1] === 0 ? "empty" : ""}`} data-testid="bg-die-1">{state.diceShown[1] || "·"}</span>
          {state.diceRemaining.length > 0 && (
            <span className="bg-dice-remaining">
              remaining: {state.diceRemaining.join(", ")}
            </span>
          )}
        </div>
        <div className="bg-controls">
          {state.phase === "preRoll" && state.turn === "P" && (
            <>
              <button
                className="bg-btn primary"
                onClick={() => dispatch({ type: "roll" } as MatchAction)}
                data-testid="hint-target-backgammon-full-match-primary"
                title="Roll the two dice"
              >Roll</button>
              <button
                className="bg-btn"
                disabled={state.crawford || (state.cubeOwner !== null && state.cubeOwner !== "P")}
                onClick={() => dispatch({ type: "offerDouble" } as MatchAction)}
                title={state.crawford ? "Cube disabled during Crawford game" : "Offer to double the cube"}
                data-testid="bg-offer-double"
              >Double</button>
              <button
                className="bg-btn warn"
                onClick={() => dispatch({ type: "resign" } as MatchAction)}
                title="Resign this single game (CPU is awarded the current cube value)"
              >Resign</button>
            </>
          )}
          {state.phase === "moving" && state.turn === "P" && (
            <>
              <button
                className="bg-btn"
                onClick={() => dispatch({ type: "endTurn" } as MatchAction)}
                disabled={legalMoves.length > 0}
                title={legalMoves.length > 0 ? "Use all dice you can before ending the turn" : "End your turn"}
                data-testid="bg-end-turn"
              >End Turn</button>
              <button
                className="bg-btn"
                onClick={() => dispatch({ type: "passMove" } as MatchAction)}
                disabled={legalMoves.length > 0}
                title={legalMoves.length > 0 ? "Still have legal moves" : "Skip your remaining dice"}
              >Pass</button>
            </>
          )}
          {state.phase === "doubleOffered" && state.turn === "P" && (
            <>
              <span className="bg-prompt">You offered the cube.</span>
              <span className="bg-prompt">Waiting for CPU…</span>
            </>
          )}
          {state.phase === "doubleOffered" && state.turn === "C" && (
            <>
              <span className="bg-prompt">CPU offers the cube. Take or drop?</span>
              <button
                className="bg-btn primary"
                onClick={() => dispatch({ type: "takeDouble" } as MatchAction)}
                title="Accept the double — cube doubles and you own it"
                data-testid="bg-take-double"
              >Take</button>
              <button
                className="bg-btn warn"
                onClick={() => dispatch({ type: "dropDouble" } as MatchAction)}
                title="Drop — CPU is awarded the current cube value"
                data-testid="bg-drop-double"
              >Drop</button>
            </>
          )}
        </div>
      </div>

      {selectedFrom !== null && state.phase === "moving" && (
        <div className="bg-die-picker">
          <span className="bg-die-picker-label">Move from {selectedFrom === -1 ? "Bar" : `point ${selectedFrom + 1}`} with die:</span>
          {legalDiceFrom(selectedFrom).map((d) => (
            <button key={d} className="bg-btn small" onClick={() => dispatchMove(selectedFrom, d)} title={`Use die showing ${d}`}>
              {d}
            </button>
          ))}
          <button className="bg-btn small ghost" onClick={() => setSelectedFrom(null)} title="Cancel selection">Cancel</button>
        </div>
      )}

      {(isGameOver || isMatchOver) && state.lastResult && (
        <div className="bg-result bounce-in">
          <h3>
            {isMatchOver
              ? (state.scoreP > state.scoreC ? "You win the match!" : "CPU wins the match")
              : `${state.lastResult.winner === "P" ? "You" : "CPU"} won this game`}
          </h3>
          <div className="bg-result-detail">
            {state.lastResult.cubeDropped
              ? `Cube dropped at ${state.lastResult.cube}: +${state.lastResult.pointsAwarded} point${state.lastResult.pointsAwarded === 1 ? "" : "s"}`
              : `${state.lastResult.multiplier === 3 ? "Backgammon" : state.lastResult.multiplier === 2 ? "Gammon" : "Single"} × cube ${state.lastResult.cube} = ${state.lastResult.pointsAwarded} point${state.lastResult.pointsAwarded === 1 ? "" : "s"}`}
          </div>
          {isGameOver && (
            <button
              className="bg-btn primary"
              onClick={() => dispatch({ type: "nextGame" } as MatchAction)}
              data-testid="hint-target-backgammon-full-match-primary"
              title="Start the next game in the match"
            >Next Game</button>
          )}
        </div>
      )}

      <div className="bg-help">
        {state.turn === "C" && state.phase === "preRoll" ? "CPU's turn…" : null}
        {state.phase === "moving" && state.turn === "P" && legalMoves.length === 0 ? "No legal moves — press End Turn." : null}
      </div>
      <span className="bg-points-info" aria-hidden="true">{POINTS} points</span>
    </div>
  );
}
