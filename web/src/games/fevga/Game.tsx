import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FevgaState, FevgaSettings, FevgaAction } from "./state.js";
import { isTerminal, legalMoves, POINTS, CHECKERS_PER_SIDE, HIT_ENABLED, PIN_ENABLED, BLOCK_ONLY, THREE_DICE } from "./state.js";
import "./Game.css";

export function FevgaGame({ state, dispatch, onGameOver }: GameProps<FevgaState, FevgaSettings>): JSX.Element {
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
      <div className="fevga-wrap">
        <h2 className={`fevga-banner ${won ? "fevga-win" : "fevga-loss"}`}>{won ? "You won!" : "CPU won!"}</h2>
        <div className="fevga-score">Final score: {state.score}</div>
      </div>
    );
  }

  const renderPoint = (i: number) => {
    const p = state.pPoints[i] || 0;
    const c = state.cPoints[i] || 0;
    const pinSide = state.pinned[i];
    const myMoves = movesByFrom.get(i) || [];
    return (
      <div key={i} className={`fevga-point ${i % 2 === 0 ? "fevga-even" : "fevga-odd"}`}>
        <div className="fevga-point-num">{i + 1}</div>
        <div className="fevga-stack">
          {Array.from({ length: p }, (_, k) => (
            <span key={`p${k}`} className="fevga-chk fevga-chk-p" title={`P @ ${i + 1}`} />
          ))}
          {Array.from({ length: c }, (_, k) => (
            <span key={`c${k}`} className="fevga-chk fevga-chk-c" title={`C @ ${i + 1}`} />
          ))}
          {pinSide ? <span className="fevga-pin">PIN</span> : null}
        </div>
        {myMoves.length > 0 && isPTurn && (
          <div className="fevga-movehint">
            {myMoves.map((pips, k) => (
              <button
                key={k}
                className="fevga-movebtn"
                onClick={() => dispatch({ type: "move", from: i, pips } as FevgaAction)}
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
    <div className="fevga-wrap">
      <div className="fevga-status">
        {isPTurn ? (state.phase === "rolling" ? "Your turn — roll the dice." : "Move your checkers.") : "CPU is moving..."}
      </div>
      <div className="fevga-meta">
        <span className="fevga-info">P borne: {state.pBorne}/{CHECKERS_PER_SIDE}</span>
        <span className="fevga-info">C borne: {state.cBorne}/{CHECKERS_PER_SIDE}</span>
        {HIT_ENABLED && (
          <>
            <span className="fevga-info">P bar: {state.pBar}</span>
            <span className="fevga-info">C bar: {state.cBar}</span>
          </>
        )}
        {PIN_ENABLED && <span className="fevga-info">Pin variant</span>}
        {BLOCK_ONLY && <span className="fevga-info">No-hit (block)</span>}
        {THREE_DICE && <span className="fevga-info">3 dice</span>}
      </div>
      <div className="fevga-dicerow">
        {state.dice.length > 0 ? state.dice.map((d, idx) => (
          <div key={idx} className="fevga-die">{d}</div>
        )) : <div className="fevga-die fevga-die-empty">-</div>}
        {state.phase === "rolling" && isPTurn && (
          <button className="fevga-btn fevga-btn-roll" onClick={() => dispatch({ type: "roll" } as FevgaAction)}>Roll Dice</button>
        )}
        {state.phase === "moving" && isPTurn && (
          <button className="fevga-btn fevga-btn-end" onClick={() => dispatch({ type: "endTurn" } as FevgaAction)}>End Turn</button>
        )}
        {state.diceLeft.length > 0 && (
          <span className="fevga-dleft">left: {state.diceLeft.join(", ")}</span>
        )}
      </div>
      <div className="fevga-board">
        <div className="fevga-half fevga-half-top">
          {Array.from({ length: halfA }, (_, k) => renderPoint(POINTS - 1 - k))}
        </div>
        <div className="fevga-half fevga-half-bot">
          {Array.from({ length: POINTS - halfA }, (_, k) => renderPoint(k))}
        </div>
      </div>
      {HIT_ENABLED && (state.pBar > 0 || state.cBar > 0) && (
        <div className="fevga-bar">
          {state.pBar > 0 && <span className="fevga-bar-p">P bar x{state.pBar}</span>}
          {state.cBar > 0 && <span className="fevga-bar-c">C bar x{state.cBar}</span>}
        </div>
      )}
      <div className="fevga-info-line">Track: {POINTS} points · Checkers per side: {CHECKERS_PER_SIDE}</div>
    </div>
  );
}
