import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DealOrNoDealState, DondAction, DealOrNoDealSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

function fmtMoney(n: number): string {
  if (n < 1) return `$${n.toFixed(2)}`;
  if (n >= 1000000) return `$${(n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 2)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return `$${n.toLocaleString()}`;
}

export function DealOrNoDeal({ state, dispatch, onGameOver }: GameProps<DealOrNoDealState, DealOrNoDealSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const allAmounts = [...new Set(state.cases.map(c => c.amount))].sort((a, b) => a - b);
  const eliminatedAmounts = new Set(state.cases.filter(c => c.eliminated).map(c => c.amount));

  if (terminal || state.phase === "deal" || state.phase === "done" || state.phase === "no_deal_end") {
    const ownCase = state.cases.find(c => c.id === state.playerCaseId);
    return (
      <div className="dond-wrap">
        <div className="dond-done">
          <h2>
            {state.phase === "deal" ? "Deal Accepted!" : state.phase === "no_deal_end" ? "No Deal!" : "Final Reveal!"}
          </h2>
          {state.phase === "deal" && (
            <>
              <p>You accepted the bank's offer:</p>
              <div className="dond-done-amount">{fmtMoney(state.bankOffer)}</div>
              {ownCase && <p style={{ marginTop: 12, color: "#888" }}>Your case held: {fmtMoney(ownCase.amount)}</p>}
            </>
          )}
          {(state.phase === "no_deal_end" || state.phase === "done") && ownCase && (
            <>
              <p>Your case contained:</p>
              <div className="dond-done-amount">{fmtMoney(ownCase.amount)}</div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="dond-wrap">
      <div className="dond-header">
        <span className="dond-title-badge">Deal or No Deal</span>
        {state.phase !== "pick_own" && <span>Round {state.round}</span>}
        {state.phase === "eliminating" && <span>Open {state.casesThisRound} more</span>}
        {state.playerCaseId !== null && <span>Your case: #{state.playerCaseId}</span>}
      </div>

      {state.phase === "pick_own" && (
        <div className="dond-instruction">Pick your case — it might hold the jackpot!</div>
      )}

      <div className="dond-amounts">
        {allAmounts.map(a => (
          <span key={a} className={`dond-amount-tag ${eliminatedAmounts.has(a) ? "gone" : "active"}`}>
            {fmtMoney(a)}
          </span>
        ))}
      </div>

      <div className="dond-cases-grid">
        {state.cases.map(c => {
          let cls = "dond-case ";
          if (c.eliminated) cls += "eliminated";
          else if (c.id === state.playerCaseId) cls += "player";
          else if (state.phase === "pick_own") cls += "selectable";
          else if (state.phase === "eliminating") cls += "selectable";
          else cls += "available";

          const clickable =
            (state.phase === "pick_own" && !c.eliminated) ||
            (state.phase === "eliminating" && !c.eliminated && c.id !== state.playerCaseId);

          return (
            <button
              key={c.id}
              className={cls}
              disabled={!clickable}
              onClick={() => {
                if (state.phase === "pick_own") dispatch({ type: "pick_case", caseId: c.id } as DondAction);
                else if (state.phase === "eliminating") dispatch({ type: "eliminate", caseId: c.id } as DondAction);
              }}
            >
              {c.eliminated ? fmtMoney(c.amount) : (
                <>
                  <div className="dond-case-label">Case</div>
                  <div>#{c.id}</div>
                </>
              )}
            </button>
          );
        })}
      </div>

      {state.phase === "bank_offer" && (
        <div className="dond-bank">
          <div className="dond-bank-title">The Bank Offers You</div>
          <div className="dond-bank-amount">{fmtMoney(state.bankOffer)}</div>
          <div className="dond-bank-actions">
            <button className="dond-btn deal" onClick={() => dispatch({ type: "accept_deal" } as DondAction)}>
              DEAL
            </button>
            <button className="dond-btn no-deal" onClick={() => dispatch({ type: "reject_deal" } as DondAction)}>
              NO DEAL
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
