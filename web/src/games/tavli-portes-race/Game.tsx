import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TavliPortState, TavliPortSettings, TavliPortAction } from "./state.js";
import { isTerminal, legalMoves, POINTS, CHECKERS_PER_SIDE, HIT_ENABLED, PIN_ENABLED, BLOCK_ONLY, THREE_DICE } from "./state.js";
import "./Game.css";

export function TavliPortGame({ state, dispatch, onGameOver }: GameProps<TavliPortState, TavliPortSettings>): JSX.Element {
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
      <div className="tavli-port-wrap">
        <h2 className={`tavli-port-banner ${won ? "tavli-port-win" : "tavli-port-loss"}`}>{won ? "You won!" : "CPU won!"}</h2>
        <div className="tavli-port-score">Final score: {state.score}</div>
      </div>
    );
  }

  const renderPoint = (i: number) => {
    const p = state.pPoints[i] || 0;
    const c = state.cPoints[i] || 0;
    const pinSide = state.pinned[i];
    const myMoves = movesByFrom.get(i) || [];
    return (
      <div key={i} className={`tavli-port-point ${i % 2 === 0 ? "tavli-port-even" : "tavli-port-odd"}`}>
        <div className="tavli-port-point-num">{i + 1}</div>
        <div className="tavli-port-stack">
          {Array.from({ length: p }, (_, k) => (
            <span key={`p${k}`} className="tavli-port-chk tavli-port-chk-p" title={`P @ ${i + 1}`} />
          ))}
          {Array.from({ length: c }, (_, k) => (
            <span key={`c${k}`} className="tavli-port-chk tavli-port-chk-c" title={`C @ ${i + 1}`} />
          ))}
          {pinSide ? <span className="tavli-port-pin">PIN</span> : null}
        </div>
        {myMoves.length > 0 && isPTurn && (
          <div className="tavli-port-movehint">
            {myMoves.map((pips, k) => (
              <button
                key={k}
                className="tavli-port-movebtn"
                onClick={() => dispatch({ type: "move", from: i, pips } as TavliPortAction)}
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
    <div className="tavli-port-wrap">
      <div className="tavli-port-status">
        {isPTurn ? (state.phase === "rolling" ? "Your turn — roll the dice." : "Move your checkers.") : "CPU is moving..."}
      </div>
      <div className="tavli-port-meta">
        <span className="tavli-port-info">P borne: {state.pBorne}/{CHECKERS_PER_SIDE}</span>
        <span className="tavli-port-info">C borne: {state.cBorne}/{CHECKERS_PER_SIDE}</span>
        {HIT_ENABLED && (
          <>
            <span className="tavli-port-info">P bar: {state.pBar}</span>
            <span className="tavli-port-info">C bar: {state.cBar}</span>
          </>
        )}
        {PIN_ENABLED && <span className="tavli-port-info">Pin variant</span>}
        {BLOCK_ONLY && <span className="tavli-port-info">No-hit (block)</span>}
        {THREE_DICE && <span className="tavli-port-info">3 dice</span>}
      </div>
      <div className="tavli-port-dicerow">
        {state.dice.length > 0 ? state.dice.map((d, idx) => (
          <div key={idx} className="tavli-port-die">{d}</div>
        )) : <div className="tavli-port-die tavli-port-die-empty">-</div>}
        {state.phase === "rolling" && isPTurn && (
          <button className="tavli-port-btn tavli-port-btn-roll" onClick={() => dispatch({ type: "roll" } as TavliPortAction)}>Roll Dice</button>
        )}
        {state.phase === "moving" && isPTurn && (
          <button className="tavli-port-btn tavli-port-btn-end" onClick={() => dispatch({ type: "endTurn" } as TavliPortAction)}>End Turn</button>
        )}
        {state.diceLeft.length > 0 && (
          <span className="tavli-port-dleft">left: {state.diceLeft.join(", ")}</span>
        )}
      </div>
      <div className="tavli-port-board">
        <div className="tavli-port-half tavli-port-half-top">
          {Array.from({ length: halfA }, (_, k) => renderPoint(POINTS - 1 - k))}
        </div>
        <div className="tavli-port-half tavli-port-half-bot">
          {Array.from({ length: POINTS - halfA }, (_, k) => renderPoint(k))}
        </div>
      </div>
      {HIT_ENABLED && (state.pBar > 0 || state.cBar > 0) && (
        <div className="tavli-port-bar">
          {state.pBar > 0 && <span className="tavli-port-bar-p">P bar x{state.pBar}</span>}
          {state.cBar > 0 && <span className="tavli-port-bar-c">C bar x{state.cBar}</span>}
        </div>
      )}
      <div className="tavli-port-info-line">Track: {POINTS} points · Checkers per side: {CHECKERS_PER_SIDE}</div>
    </div>
  );
}
