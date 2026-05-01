import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PlakotoState, PlakotoSettings, PlakotoAction } from "./state.js";
import { isTerminal, legalMoves, POINTS, CHECKERS_PER_SIDE, HIT_ENABLED, PIN_ENABLED, BLOCK_ONLY, THREE_DICE } from "./state.js";
import "./Game.css";

export function PlakotoGame({ state, dispatch, onGameOver }: GameProps<PlakotoState, PlakotoSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  const moves = state.turn === "P" && state.phase === "moving" ? legalMoves(state, "P") : [];
  const movesByFrom = new Map<number, number[]>();
  for (const m of moves) {
    if (!movesByFrom.has(m.from)) movesByFrom.set(m.from, []);
    movesByFrom.get(m.from)!.push(m.pips);
  }

  const isPTurn = state.turn === "P";
  const halfA = Math.floor(POINTS / 2);

  if (state.phase === "done") {
    const won = state.winner === "P";
    return (
      <div className="plakoto-wrap">
        <h2 className={`plakoto-banner ${won ? "plakoto-win" : "plakoto-loss"}`}>{won ? "You won!" : "CPU won!"}</h2>
        <div className="plakoto-score">Final score: {state.score}</div>
      </div>
    );
  }

  const renderPoint = (i: number) => {
    const p = state.pPoints[i] || 0;
    const c = state.cPoints[i] || 0;
    const pinSide = state.pinned[i];
    const myMoves = movesByFrom.get(i) || [];
    return (
      <div key={i} className={`plakoto-point ${i % 2 === 0 ? "plakoto-even" : "plakoto-odd"}`}>
        <div className="plakoto-point-num">{i + 1}</div>
        <div className="plakoto-stack">
          {Array.from({ length: p }, (_, k) => (
            <span key={`p${k}`} className="plakoto-chk plakoto-chk-p" title={`P @ ${i + 1}`} />
          ))}
          {Array.from({ length: c }, (_, k) => (
            <span key={`c${k}`} className="plakoto-chk plakoto-chk-c" title={`C @ ${i + 1}`} />
          ))}
          {pinSide ? <span className="plakoto-pin">PIN</span> : null}
        </div>
        {myMoves.length > 0 && isPTurn && (
          <div className="plakoto-movehint">
            {myMoves.map((pips, k) => (
              <button
                key={k}
                className="plakoto-movebtn"
                onClick={() => dispatch({ type: "move", from: i, pips } as PlakotoAction)}
              >
                +{pips}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="plakoto-wrap">
      <div className="plakoto-status">
        {isPTurn ? (state.phase === "rolling" ? "Your turn — roll the dice." : "Move your checkers.") : "CPU is moving..."}
      </div>
      <div className="plakoto-meta">
        <span className="plakoto-info">P borne: {state.pBorne}/{CHECKERS_PER_SIDE}</span>
        <span className="plakoto-info">C borne: {state.cBorne}/{CHECKERS_PER_SIDE}</span>
        {HIT_ENABLED && (
          <>
            <span className="plakoto-info">P bar: {state.pBar}</span>
            <span className="plakoto-info">C bar: {state.cBar}</span>
          </>
        )}
        {PIN_ENABLED && <span className="plakoto-info">Pin variant</span>}
        {BLOCK_ONLY && <span className="plakoto-info">No-hit (block)</span>}
        {THREE_DICE && <span className="plakoto-info">3 dice</span>}
      </div>
      <div className="plakoto-dicerow">
        {state.dice.length > 0 ? state.dice.map((d, idx) => (
          <div key={idx} className="plakoto-die">{d}</div>
        )) : <div className="plakoto-die plakoto-die-empty">-</div>}
        {state.phase === "rolling" && isPTurn && (
          <button className="plakoto-btn plakoto-btn-roll" onClick={() => dispatch({ type: "roll" } as PlakotoAction)}>Roll Dice</button>
        )}
        {state.phase === "moving" && isPTurn && (
          <button className="plakoto-btn plakoto-btn-end" onClick={() => dispatch({ type: "endTurn" } as PlakotoAction)}>End Turn</button>
        )}
        {state.diceLeft.length > 0 && (
          <span className="plakoto-dleft">left: {state.diceLeft.join(", ")}</span>
        )}
      </div>
      <div className="plakoto-board">
        <div className="plakoto-half plakoto-half-top">
          {Array.from({ length: halfA }, (_, k) => renderPoint(POINTS - 1 - k))}
        </div>
        <div className="plakoto-half plakoto-half-bot">
          {Array.from({ length: POINTS - halfA }, (_, k) => renderPoint(k))}
        </div>
      </div>
      {HIT_ENABLED && (state.pBar > 0 || state.cBar > 0) && (
        <div className="plakoto-bar">
          {state.pBar > 0 && <span className="plakoto-bar-p">P bar x{state.pBar}</span>}
          {state.cBar > 0 && <span className="plakoto-bar-c">C bar x{state.cBar}</span>}
        </div>
      )}
      <div className="plakoto-info-line">Track: {POINTS} points · Checkers per side: {CHECKERS_PER_SIDE}</div>
    </div>
  );
}
