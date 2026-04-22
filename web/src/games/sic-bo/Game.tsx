import React from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SicBoState, SicBoAction, SicBoSettings, SicBoBetType } from "./state.js";
import { isTerminal, betLabel } from "./state.js";
import "./Game.css";

type Props = GameProps<SicBoState, SicBoSettings>;

const DIE_FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

const BET_UNIT = 10;

interface BetOption {
  label: string;
  payout: string;
  betType: SicBoBetType;
}

const BOARD_BETS: BetOption[] = [
  { label: "Small\n(4–10)", payout: "1:1", betType: "small" },
  { label: "Big\n(11–17)", payout: "1:1", betType: "big" },
  { label: "Any Triple", payout: "30:1", betType: "any-triple" },
  ...([1, 2, 3, 4, 5, 6].map(v => ({ label: `Triple ${v}`, payout: "180:1", betType: { type: "specific-triple" as const, value: v } }))),
  ...([4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map(v => ({ label: `Sum ${v}`, payout: getSumPayoutLabel(v), betType: { type: "specific-sum" as const, value: v } }))),
  ...([1, 2, 3, 4, 5, 6].map(v => ({ label: `Single ${v}`, payout: "1/2/3:1", betType: { type: "specific-single" as const, value: v } }))),
  ...([1, 2, 3, 4, 5, 6].map(v => ({ label: `Double ${v}`, payout: "10:1", betType: { type: "specific-double" as const, value: v } }))),
];

function getSumPayoutLabel(v: number): string {
  const payouts: Record<number, string> = {
    4: "60:1", 17: "60:1", 5: "30:1", 16: "30:1",
    6: "17:1", 15: "17:1", 7: "12:1", 14: "12:1",
    8: "8:1", 13: "8:1", 9: "6:1", 12: "6:1",
    10: "6:1", 11: "6:1",
  };
  return payouts[v] ?? "?";
}

export function SicBo({ state, dispatch, onGameOver }: Props) {
  const term = isTerminal(state);
  if (term) onGameOver(term.score);

  const maxRolls = parseInt(state.settings.rollsPerSession, 10);
  const totalBet = state.bets.reduce((s, b) => s + b.amount, 0);

  return (
    <div className="sb-root">
      <div className="sb-bankroll">Bankroll: ${state.bankroll}</div>
      <div>Roll {state.rollsPlayed} / {maxRolls}</div>

      {state.dice && (
        <div className="sb-dice">
          {state.dice.map((d, i) => (
            <div key={i} className="sb-die">{DIE_FACES[d]}</div>
          ))}
        </div>
      )}

      {state.dice && (
        <div className="sb-sum-info">
          Sum: {state.dice[0] + state.dice[1] + state.dice[2]}
          {state.dice[0] === state.dice[1] && state.dice[1] === state.dice[2] ? " — Triple!" : ""}
        </div>
      )}

      {state.lastResult && (
        <div className="sb-result">{state.lastResult}</div>
      )}

      {state.phase === "rolled" && (
        <button
          className="sb-btn next"
          onClick={() => dispatch({ type: "roll" } as SicBoAction)}
          disabled={state.rollsPlayed >= maxRolls || state.bankroll <= 0}
        >
          Next Roll
        </button>
      )}

      {state.phase === "betting" && (
        <>
          <div className="sb-board">
            {BOARD_BETS.slice(0, 9).map((opt, i) => (
              <button
                key={i}
                className="sb-bet-btn"
                onClick={() => dispatch({ type: "place-bet", betType: opt.betType, amount: BET_UNIT } as SicBoAction)}
                disabled={state.bankroll < BET_UNIT}
                title={`${opt.label} — ${opt.payout}`}
              >
                <div style={{ whiteSpace: "pre-line" }}>{opt.label}</div>
                <div style={{ color: "#557", fontSize: "0.7rem" }}>{opt.payout}</div>
              </button>
            ))}
          </div>
          <details style={{ width: "100%", maxWidth: 480 }}>
            <summary style={{ cursor: "pointer", fontSize: "0.9rem", color: "#555" }}>More bets (Sums, Singles, Doubles)…</summary>
            <div className="sb-board" style={{ marginTop: 8 }}>
              {BOARD_BETS.slice(9).map((opt, i) => (
                <button
                  key={i}
                  className="sb-bet-btn"
                  onClick={() => dispatch({ type: "place-bet", betType: opt.betType, amount: BET_UNIT } as SicBoAction)}
                  disabled={state.bankroll < BET_UNIT}
                  title={`${opt.label} — ${opt.payout}`}
                >
                  <div style={{ whiteSpace: "pre-line" }}>{opt.label}</div>
                  <div style={{ color: "#557", fontSize: "0.7rem" }}>{opt.payout}</div>
                </button>
              ))}
            </div>
          </details>

          {state.bets.length > 0 && (
            <div className="sb-active-bets">
              <div style={{ fontSize: "0.85rem", color: "#555", marginBottom: 4 }}>Active bets (${BET_UNIT} each):</div>
              <div className="sb-bets-list">
                {state.bets.map((b, i) => (
                  <span key={i} className="sb-bet-chip">{betLabel(b.betType)}</span>
                ))}
              </div>
              <div style={{ fontSize: "0.85rem", color: "#555", marginBottom: 6 }}>Total: ${totalBet}</div>
              <div className="sb-actions">
                <button className="sb-btn clear" onClick={() => dispatch({ type: "clear-bets" } as SicBoAction)}>
                  Clear Bets
                </button>
                <button
                  className="sb-btn roll"
                  onClick={() => dispatch({ type: "roll" } as SicBoAction)}
                >
                  Roll Dice!
                </button>
              </div>
            </div>
          )}

          {state.bets.length === 0 && (
            <div style={{ fontSize: "0.9rem", color: "#888" }}>Select bets from the board (${BET_UNIT} each)</div>
          )}
        </>
      )}
    </div>
  );
}
