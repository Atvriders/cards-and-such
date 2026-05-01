import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MiniBlackjackState, MiniBlackjackAction, MiniBlackjackSettings } from "./state.js";
import { isTerminal, handTotal, MIN_BET } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Game.css";

export function MiniBlackjackGame({ state, dispatch, onGameOver }: GameProps<MiniBlackjackState, MiniBlackjackSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const [betInput, setBetInput] = useState<number>(MIN_BET);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (state.phase === "player") {
        if (e.key === "h" || e.key === "H") { e.preventDefault(); dispatch({ type: "hit" } as MiniBlackjackAction); }
        else if (e.key === "s" || e.key === "S") { e.preventDefault(); dispatch({ type: "stand" } as MiniBlackjackAction); }
        else if ((e.key === "d" || e.key === "D") && state.player.length === 2 && state.bankroll >= state.bet) {
          e.preventDefault(); dispatch({ type: "double" } as MiniBlackjackAction);
        }
      } else if (state.phase === "settle" && (e.key === "Enter" || e.key === "n" || e.key === "N")) {
        e.preventDefault(); dispatch({ type: "next" } as MiniBlackjackAction);
      } else if (state.phase === "betting" && (e.key === "Enter" || e.key === "d" || e.key === "D")) {
        e.preventDefault(); dispatch({ type: "deal", bet: betInput } as MiniBlackjackAction);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dispatch, state.phase, state.player.length, state.bankroll, state.bet, betInput]);

  const playerTotal = handTotal(state.player);
  const dealerVisible = state.dealerHoleHidden ? state.dealer.slice(0, 1) : state.dealer;
  const dealerTotal = state.dealerHoleHidden && state.dealer.length > 0 ? `${handTotal(state.dealer.slice(0,1))}+?` : String(handTotal(state.dealer));

  const canDouble = state.phase === "player" && state.player.length === 2 && state.bankroll >= state.bet;

  return (
    <div className="bj-mini-wrap">
      <div className="bj-mini-hud">
        <div className="bj-mini-stat">Bankroll <b>${state.bankroll}</b></div>
        <div className="bj-mini-stat">Bet <b>${state.bet || 0}</b></div>
        <div className="bj-mini-stat">Hand <b>#{state.hand}</b></div>
      </div>

      <div className="bj-mini-table">
        <div className="bj-mini-side bj-mini-dealer">
          <div className="bj-mini-label">Dealer {state.dealer.length > 0 && <span className="bj-mini-total">{dealerTotal}</span>}</div>
          <div className="bj-mini-hand">
            {state.dealer.length === 0 && <div className="bj-mini-slot" />}
            {state.dealer.map((c, i) => {
              const hidden = state.dealerHoleHidden && i === 1;
              return <div key={c.id} className="bj-mini-card-wrap"><Card card={c} faceDown={hidden} /></div>;
            })}
            {dealerVisible.length === 0 && state.dealer.length > 0 && <div className="bj-mini-slot" />}
          </div>
        </div>

        <div className="bj-mini-felt">
          {state.result && <div className="bj-mini-result">{state.result}</div>}
          {state.phase === "betting" && (
            <div className="bj-mini-bet">
              <label className="bj-mini-bet-label">Bet $</label>
              <input
                type="number"
                className="bj-mini-bet-input"
                min={MIN_BET}
                max={state.bankroll}
                value={betInput}
                onChange={(e) => setBetInput(Math.max(MIN_BET, Math.min(state.bankroll, Number(e.target.value) || MIN_BET)))}
              />
              <button className="bj-mini-btn primary" onClick={() => dispatch({ type: "deal", bet: betInput } as MiniBlackjackAction)}>
                Deal
              </button>
            </div>
          )}
        </div>

        <div className="bj-mini-side bj-mini-you">
          <div className="bj-mini-label">You {state.player.length > 0 && <span className="bj-mini-total">{playerTotal}</span>}</div>
          <div className="bj-mini-hand">
            {state.player.length === 0 && <div className="bj-mini-slot" />}
            {state.player.map((c) => <div key={c.id} className="bj-mini-card-wrap"><Card card={c} /></div>)}
          </div>
        </div>
      </div>

      <div className="bj-mini-actions">
        {state.phase === "player" && (
          <>
            <button className="bj-mini-btn primary" aria-label="Hit (H)" onClick={() => dispatch({ type: "hit" } as MiniBlackjackAction)}>Hit</button>
            <button className="bj-mini-btn alt" aria-label="Stand (S)" onClick={() => dispatch({ type: "stand" } as MiniBlackjackAction)}>Stand</button>
            {canDouble && <button className="bj-mini-btn warn" aria-label="Double (D)" onClick={() => dispatch({ type: "double" } as MiniBlackjackAction)}>Double</button>}
          </>
        )}
        {state.phase === "settle" && (
          <button className="bj-mini-btn primary" onClick={() => dispatch({ type: "next" } as MiniBlackjackAction)}>
            Next hand
          </button>
        )}
      </div>

      {state.phase === "done" && (
        <div className="bj-mini-done">
          <h2>Game Over</h2>
          <div className="bj-mini-final">Final bankroll: ${state.bankroll}</div>
        </div>
      )}

      <div className="bj-mini-log">
        {state.log.slice(-5).map((l, i) => <div key={i} className="bj-mini-log-line">{l}</div>)}
      </div>
    </div>
  );
}
