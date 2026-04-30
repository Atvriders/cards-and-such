import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MiniPokerState, MiniPokerAction, MiniPokerSettings } from "./state.js";
import { isTerminal, rankHand, ANTE } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Game.css";

export function MiniPokerGame({ state, dispatch, onGameOver }: GameProps<MiniPokerState, MiniPokerSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const [betInput, setBetInput] = useState<number>(10);

  const playerRank = state.player.length === 5 ? rankHand(state.player) : null;
  const cpuRank = state.cpu.length === 5 ? rankHand(state.cpu) : null;

  return (
    <div className="pokermini-wrap">
      <div className="pokermini-hud">
        <div className="pokermini-stat">You <b>${state.bankroll}</b></div>
        <div className="pokermini-stat">Pot <b>${state.pot}</b></div>
        <div className="pokermini-stat">CPU <b>${state.cpuBank}</b></div>
        <div className="pokermini-stat">Hand #<b>{state.round}</b></div>
      </div>

      <div className="pokermini-cpu">
        <div className="pokermini-label">CPU {state.cpuRevealed && cpuRank ? <span className="pokermini-rank">{cpuRank.name}</span> : null}</div>
        <div className="pokermini-hand">
          {state.cpu.length === 0 && <div className="pokermini-slot" />}
          {state.cpu.map((c) => (
            <div key={c.id} className="pokermini-card-wrap"><Card card={c} faceDown={!state.cpuRevealed} /></div>
          ))}
        </div>
      </div>

      <div className="pokermini-felt">
        {state.result && <div className="pokermini-result">{state.result}</div>}
      </div>

      <div className="pokermini-you">
        <div className="pokermini-label">You {playerRank ? <span className="pokermini-rank">{playerRank.name}</span> : null}</div>
        <div className="pokermini-hand">
          {state.player.length === 0 && <div className="pokermini-slot" />}
          {state.player.map((c) => {
            const isSel = state.selected.includes(c.id);
            return (
              <div
                key={c.id}
                className={`pokermini-card-wrap selectable ${isSel ? "discard" : ""}`}
                onClick={() => state.phase === "draw" && (dispatch as (a: MiniPokerAction) => void)({ type: "toggle", cardId: c.id })}
              >
                <Card card={c} />
                {isSel && <div className="pokermini-x">discard</div>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="pokermini-actions">
        {state.phase === "ante" && (
          <button className="pokermini-btn primary" onClick={() => (dispatch as (a: MiniPokerAction) => void)({ type: "deal" })}>
            Ante ${ANTE} & Deal
          </button>
        )}
        {state.phase === "draw" && (
          <>
            <div className="pokermini-bet">
              <label>Raise $</label>
              <input
                type="number"
                min={1}
                max={Math.min(state.bankroll, state.cpuBank)}
                value={betInput}
                onChange={(e) => setBetInput(Math.max(1, Number(e.target.value) || 1))}
              />
              <button className="pokermini-btn alt" onClick={() => (dispatch as (a: MiniPokerAction) => void)({ type: "raise", amount: betInput })}>
                Raise
              </button>
            </div>
            <button className="pokermini-btn primary" onClick={() => (dispatch as (a: MiniPokerAction) => void)({ type: "draw" })}>
              Draw {state.selected.length} card{state.selected.length === 1 ? "" : "s"}
            </button>
            <button className="pokermini-btn warn" onClick={() => (dispatch as (a: MiniPokerAction) => void)({ type: "fold" })}>
              Fold
            </button>
          </>
        )}
        {state.phase === "showdown" && state.pot > 0 && (
          <button className="pokermini-btn primary" onClick={() => (dispatch as (a: MiniPokerAction) => void)({ type: "next" })}>
            Showdown
          </button>
        )}
        {state.phase === "showdown" && state.pot === 0 && (
          <button className="pokermini-btn primary" onClick={() => (dispatch as (a: MiniPokerAction) => void)({ type: "next" })}>
            Next hand
          </button>
        )}
      </div>

      {state.phase === "done" && (
        <div className="pokermini-done">
          <h2>Game Over</h2>
          <div>Final bankroll: ${state.bankroll}</div>
        </div>
      )}

      <div className="pokermini-log">
        {state.log.slice(-5).map((l, i) => <div key={i} className="pokermini-log-line">{l}</div>)}
      </div>
    </div>
  );
}
