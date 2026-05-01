import { useEffect, useMemo, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type {
  HoldemNoLimitState,
  HoldemNoLimitAction,
  HoldemNoLimitSettings,
} from "./state.js";
import { isTerminal, callAmount, minRaiseTotal, maxRaiseTotal, handClass } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Game.css";

function emptySlot(key: string | number): JSX.Element {
  return <div key={key} className="holdem-card-slot" aria-hidden="true" />;
}

export function HoldemNoLimitGame({ state, dispatch, onGameOver }:
  GameProps<HoldemNoLimitState, HoldemNoLimitSettings>): JSX.Element {

  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  const toCall = state.cpuBet - state.playerBet;
  const canCheck = toCall <= 0;
  const canCall = toCall > 0 && state.playerStack > 0;
  const canRaise = state.playerStack > 0 && state.phase !== "idle" && state.phase !== "showdown" && state.phase !== "done";
  const canAct = state.playerToAct &&
    state.phase !== "idle" && state.phase !== "showdown" && state.phase !== "done";

  const minR = useMemo(() => minRaiseTotal(state), [state]);
  const maxR = useMemo(() => maxRaiseTotal(state), [state]);
  const [raiseTo, setRaiseTo] = useState<number>(minR);
  const [showRaise, setShowRaise] = useState<boolean>(false);

  // Reset slider whenever the legal raise window changes.
  useEffect(() => {
    setRaiseTo((prev) => {
      const clamped = Math.max(minR, Math.min(maxR, prev));
      return clamped === prev ? prev : clamped;
    });
  }, [minR, maxR]);

  const send = (a: HoldemNoLimitAction): void => dispatch(a);

  const dealLabel = state.phase === "idle"
    ? "Deal cards"
    : state.phase === "showdown"
      ? "Next hand"
      : state.phase === "done"
        ? "Game over"
        : "";

  const showCpuCards = state.showCpuHole || state.phase === "done";
  const playerHandLabel = state.playerHole.length === 2
    ? handClass([...state.playerHole, ...state.community])
    : "";
  const cpuHandLabel = showCpuCards && state.cpuHole.length === 2
    ? handClass([...state.cpuHole, ...state.community])
    : "";

  return (
    <div className="holdem-wrap">
      <div className="holdem-table">
        {/* CPU area (top) */}
        <div className="holdem-seat holdem-seat-cpu">
          <div className="holdem-seat-info">
            <div className="holdem-seat-name">
              CPU{!state.dealerIsPlayer && <span className="holdem-button" title="Dealer button">D</span>}
            </div>
            <div className="holdem-stack">${state.cpuStack}</div>
            {state.cpuBet > 0 && <div className="holdem-bet">bet ${state.cpuBet}</div>}
          </div>
          <div className="holdem-hole">
            {state.cpuHole.length === 0 ? (
              <>
                {emptySlot("cpu0")}
                {emptySlot("cpu1")}
              </>
            ) : (
              state.cpuHole.map((c, i) => (
                <Card key={`cpu-${c.id}`} card={c} faceDown={!showCpuCards} className={`holdem-card ${i === 0 ? "" : "holdem-card-tilt"}`} />
              ))
            )}
          </div>
          {cpuHandLabel && cpuHandLabel !== "incomplete" && (
            <div className="holdem-hand-label">{cpuHandLabel}</div>
          )}
        </div>

        {/* Center — pot, community, last action */}
        <div className="holdem-center">
          <div className="holdem-pot">
            <div className="holdem-pot-label">POT</div>
            <div className="holdem-pot-amount">${state.pot}</div>
          </div>
          <div className="holdem-community">
            {[0, 1, 2, 3, 4].map((i) => {
              const c = state.community[i];
              if (!c) return emptySlot(`com-${i}`);
              return <Card key={`com-${c.id}`} card={c} className="holdem-card" />;
            })}
          </div>
          <div className="holdem-status">
            {state.lastAction && <div className="holdem-action-line">{state.lastAction}</div>}
            {state.lastResult && <div className="holdem-result-line">{state.lastResult}</div>}
            <div className="holdem-phase-line">
              Phase: {state.phase} · Hand #{state.handsPlayed || "—"}
            </div>
          </div>
        </div>

        {/* Player area (bottom) */}
        <div className="holdem-seat holdem-seat-player">
          <div className="holdem-hole">
            {state.playerHole.length === 0 ? (
              <>
                {emptySlot("p0")}
                {emptySlot("p1")}
              </>
            ) : (
              state.playerHole.map((c, i) => (
                <Card key={`p-${c.id}`} card={c} className={`holdem-card ${i === 0 ? "" : "holdem-card-tilt"}`} />
              ))
            )}
          </div>
          <div className="holdem-seat-info">
            <div className="holdem-seat-name">
              You{state.dealerIsPlayer && <span className="holdem-button" title="Dealer button">D</span>}
            </div>
            <div className="holdem-stack">${state.playerStack}</div>
            {state.playerBet > 0 && <div className="holdem-bet">bet ${state.playerBet}</div>}
          </div>
          {playerHandLabel && playerHandLabel !== "incomplete" && (
            <div className="holdem-hand-label">{playerHandLabel}</div>
          )}
        </div>
      </div>

      {/* Action bar */}
      <div className="holdem-actions">
        {(state.phase === "idle" || state.phase === "showdown") && state.phase !== "done" && (
          <button className="holdem-btn holdem-btn-primary" onClick={() => send({ type: "deal" })}>
            {dealLabel}
          </button>
        )}

        {canAct && !showRaise && (
          <>
            <button className="holdem-btn holdem-btn-fold" onClick={() => send({ type: "fold" })}>
              FOLD
            </button>
            {canCheck ? (
              <button className="holdem-btn holdem-btn-check" onClick={() => send({ type: "check" })}>
                CHECK
              </button>
            ) : (
              <button
                className="holdem-btn holdem-btn-call"
                disabled={!canCall}
                onClick={() => send({ type: "call" })}
              >
                CALL ${callAmount(state)}
              </button>
            )}
            {canRaise && minR <= maxR && (
              <button
                className="holdem-btn holdem-btn-raise"
                onClick={() => { setRaiseTo(Math.max(minR, Math.min(maxR, raiseTo))); setShowRaise(true); }}
              >
                {state.cpuBet > state.playerBet ? "RAISE" : "BET"}
              </button>
            )}
          </>
        )}

        {canAct && showRaise && (
          <div className="holdem-raise-panel">
            <div className="holdem-raise-row">
              <button className="holdem-btn holdem-btn-quick" onClick={() => setRaiseTo(minR)}>min</button>
              <button className="holdem-btn holdem-btn-quick"
                onClick={() => setRaiseTo(Math.max(minR, Math.min(maxR, Math.round((state.pot + (state.cpuBet - state.playerBet)) / 2 + state.cpuBet))))}>½ pot</button>
              <button className="holdem-btn holdem-btn-quick"
                onClick={() => setRaiseTo(Math.max(minR, Math.min(maxR, state.pot + state.cpuBet)))}>pot</button>
              <button className="holdem-btn holdem-btn-quick" onClick={() => setRaiseTo(maxR)}>all-in</button>
            </div>
            <input
              className="holdem-slider"
              type="range"
              min={minR}
              max={maxR}
              step={1}
              value={raiseTo}
              onChange={(e) => setRaiseTo(parseInt(e.target.value, 10))}
            />
            <div className="holdem-raise-amount">${raiseTo}</div>
            <div className="holdem-raise-row">
              <button className="holdem-btn holdem-btn-cancel" onClick={() => setShowRaise(false)}>Cancel</button>
              <button
                className="holdem-btn holdem-btn-confirm"
                onClick={() => { send({ type: "raise", amount: raiseTo }); setShowRaise(false); }}
              >
                {state.cpuBet > state.playerBet ? `Raise to $${raiseTo}` : `Bet $${raiseTo}`}
              </button>
            </div>
          </div>
        )}

        {state.phase === "done" && (
          <div className="holdem-gameover">
            {state.playerStack > 0 ? "You won the match!" : "You're busted — CPU wins."}
          </div>
        )}
      </div>
    </div>
  );
}
