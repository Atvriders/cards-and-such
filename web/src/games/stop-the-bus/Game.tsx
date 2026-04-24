import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { StopTheBusState, StopTheBusSettings } from "./state.js";
import { isTerminal, scoreHand } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Game.css";

type StopTheBusAction =
  | { type: "swap"; handIdx: number; poolIdx: number }
  | { type: "swapAll" }
  | { type: "stopTheBus" }
  | { type: "pass" };

export function StopTheBusGame({ state, dispatch, onGameOver }: GameProps<StopTheBusState, StopTheBusSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const [selectedHand, setSelectedHand] = useState<number | null>(null);
  const [selectedPool, setSelectedPool] = useState<number | null>(null);

  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { hands, pool, turn, phase, scores } = state;
  const myHand = hands[0]!;
  const isMyTurn = turn === 0 && phase !== "done";
  const seatName = (s: number) => s === 0 ? "You" : `Bot ${s}`;
  const myScore = scoreHand(myHand);

  function handlePoolClick(pi: number): void {
    if (!isMyTurn) return;
    if (selectedHand !== null) {
      dispatch({ type: "swap", handIdx: selectedHand, poolIdx: pi } as StopTheBusAction);
      setSelectedHand(null);
      setSelectedPool(null);
    } else {
      setSelectedPool(prev => prev === pi ? null : pi);
    }
  }

  function handleHandClick(hi: number): void {
    if (!isMyTurn) return;
    if (selectedPool !== null) {
      dispatch({ type: "swap", handIdx: hi, poolIdx: selectedPool } as StopTheBusAction);
      setSelectedHand(null);
      setSelectedPool(null);
    } else {
      setSelectedHand(prev => prev === hi ? null : hi);
    }
  }

  return (
    <div className="stopbus">
      <div className="stopbus-header">
        <h2>Stop the Bus</h2>
        <div className="stopbus-info">
          {[0, 1, 2, 3].map(s => <span key={s}>{seatName(s)}: {hands[s]!.length} cards</span>)}
        </div>
      </div>

      <div className="stopbus-pool">
        <div className="stopbus-pool-label">Pool (click to select for swap):</div>
        <div className="stopbus-pool-cards">
          {pool.map((c, pi) => (
            <div key={c.id} className={`stopbus-pool-slot${selectedPool === pi ? " selected" : ""}`}
              onClick={() => handlePoolClick(pi)}>
              <Card card={c} />
            </div>
          ))}
        </div>
      </div>

      <div className="stopbus-hand">
        <div className="stopbus-hand-label">Your hand — click to swap with pool card:</div>
        <div className="stopbus-hand-cards">
          {myHand.map((c, hi) => (
            <div key={c.id} className={`stopbus-hand-slot${selectedHand === hi ? " selected" : ""}`}
              onClick={() => handleHandClick(hi)}>
              <Card card={c} />
            </div>
          ))}
        </div>
      </div>

      <div className="stopbus-score">Your hand score: {myScore.toFixed(1)} / 31</div>

      <div className="stopbus-status">
        {phase === "done"
          ? "Game over!"
          : phase === "lastRound"
          ? "Last round! (Someone stopped the bus)"
          : isMyTurn ? "Your turn — swap cards or stop the bus!" : `Waiting for ${seatName(turn)}…`}
      </div>

      {phase !== "done" && (
        <div className="stopbus-actions">
          <button className="stopbus-btn swap" disabled={!isMyTurn || selectedHand === null || selectedPool === null}
            onClick={() => { if (selectedHand !== null && selectedPool !== null) { dispatch({ type: "swap", handIdx: selectedHand, poolIdx: selectedPool } as StopTheBusAction); setSelectedHand(null); setSelectedPool(null); } }}>
            Swap
          </button>
          <button className="stopbus-btn swapall" disabled={!isMyTurn}
            onClick={() => { dispatch({ type: "swapAll" } as StopTheBusAction); setSelectedHand(null); setSelectedPool(null); }}>
            Swap All 3
          </button>
          <button className="stopbus-btn pass" disabled={!isMyTurn}
            onClick={() => dispatch({ type: "pass" } as StopTheBusAction)}>
            Pass
          </button>
          <button className="stopbus-btn stop" disabled={!isMyTurn || phase === "lastRound"}
            onClick={() => dispatch({ type: "stopTheBus" } as StopTheBusAction)}>
            Stop the Bus!
          </button>
        </div>
      )}

      {phase === "done" && (
        <div className="stopbus-result">
          <h3>Game Over!</h3>
          <div className="stopbus-final-hands">
            {[0, 1, 2, 3].map(s => (
              <div key={s} className={s === 0 ? "stopbus-you" : ""}>
                {seatName(s)}: {scoreHand(hands[s]!).toFixed(1)} pts — score: {scores[s]}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
