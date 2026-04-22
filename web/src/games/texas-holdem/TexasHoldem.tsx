import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TexasHoldemState, TexasHoldemAction } from "./state.js";
import type { TexasHoldemSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { rankHand } from "../../engines/deck/ranking.js";
import { bestFiveOf } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./TexasHoldem.css";

export function TexasHoldem({
  state,
  dispatch,
  onGameOver,
}: GameProps<TexasHoldemState, TexasHoldemSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { phase, bankroll, botBankroll, pot, playerHole, botHole, community,
    playerTurn, lastAction, lastResult, settings } = state;

  function dis(a: TexasHoldemAction) { dispatch(a); }

  const parseBlinds = (b: string) => { const [s, g] = b.split("/").map(Number); return { small: s!, big: g! }; };
  const { big } = parseBlinds(settings.blinds);
  const betAmt = (phase === "turn" || phase === "river") ? big * 2 : big;
  const toCall = state.botBet - state.playerBet;

  const canCheck = playerTurn && toCall <= 0;
  const canCall = playerTurn && toCall > 0;
  const canRaise = playerTurn && bankroll >= toCall + betAmt;
  const canFold = playerTurn && phase !== "waiting" && phase !== "showdown";

  const isActive = phase !== "waiting" && phase !== "showdown";
  const playerBest = playerHole.length === 2 && community.length >= 3
    ? rankHand(bestFiveOf([...playerHole, ...community])).class
    : "";

  return (
    <div className="texas-holdem">
      <div className="th-header">
        <span>You: ${bankroll}</span>
        <span>Bot: ${botBankroll}</span>
        {isActive && <span className="th-phase-badge">{phase}</span>}
      </div>

      {lastResult && <div className="th-result">{lastResult}</div>}
      {lastAction && !lastResult && <div className="th-action-log">{lastAction}</div>}

      <div className="th-table">
        <div className="th-side">
          <div className="th-side-label">Bot</div>
          <div className="th-cards">
            {botHole.map((c, i) => (
              <Card key={c.id + i} card={c} faceDown={phase !== "showdown"} />
            ))}
            {botHole.length === 0 && <span style={{ opacity: 0.4 }}>Waiting...</span>}
          </div>
          {phase === "showdown" && botHole.length === 2 && community.length === 5 && (
            <div className="th-hand-name">{rankHand(bestFiveOf([...botHole, ...community])).class}</div>
          )}
        </div>

        <div className="th-community">
          <div className="th-community-label">Community</div>
          <div className="th-cards">
            {community.map((c, i) => <Card key={c.id + i} card={c} />)}
            {community.length === 0 && <span style={{ opacity: 0.4 }}>—</span>}
          </div>
        </div>

        <div className="th-side">
          <div className="th-side-label">You</div>
          <div className="th-cards">
            {playerHole.map((c, i) => <Card key={c.id + i} card={c} />)}
            {playerHole.length === 0 && <span style={{ opacity: 0.4 }}>Waiting...</span>}
          </div>
          {playerBest && <div className="th-hand-name">{playerBest}</div>}
        </div>
      </div>

      {isActive && <div className="th-pot">Pot: ${pot} {toCall > 0 ? `· To call: $${toCall}` : ""}</div>}

      <div className="th-actions">
        {(phase === "waiting" || phase === "showdown") && !terminal && (
          <button className="btn-deal" onClick={() => dis({ type: "deal" })}>Deal Hand</button>
        )}
        {isActive && playerTurn && (
          <>
            <button className="btn-fold" onClick={() => dis({ type: "fold" })}>Fold</button>
            {canCheck && <button className="btn-check" onClick={() => dis({ type: "check" })}>Check</button>}
            {canCall && (
              <button className="btn-call" onClick={() => dis({ type: "call" })}>Call ${toCall}</button>
            )}
            {canRaise && (
              <button className="btn-raise" onClick={() => dis({ type: "raise" })}>
                {toCall > 0 ? `Raise $${toCall + betAmt}` : `Bet $${betAmt}`}
              </button>
            )}
          </>
        )}
        {!playerTurn && isActive && (
          <div style={{ opacity: 0.7, fontSize: "0.9rem" }}>Bot is thinking...</div>
        )}
        {terminal && (
          <div className="th-game-over">Game Over — Final: ${terminal.score}</div>
        )}
      </div>
    </div>
  );
}
