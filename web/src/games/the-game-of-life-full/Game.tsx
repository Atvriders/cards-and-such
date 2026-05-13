import { useEffect, useRef, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type {
  LifeFullState,
  LifeFullAction,
  LifeFullSettings,
  PlayerLifeState,
} from "./state.js";
import { isTerminal, finalScore, BOARD } from "./state.js";
import "./Game.css";

const KIND_LABEL: Record<string, string> = {
  start: "Start",
  branch: "Choice",
  "college-wait": "College",
  "career-pick": "Career",
  payday: "Payday",
  marry: "Marry",
  baby: "Baby",
  twins: "Twins",
  "buy-house": "House",
  "sell-house": "Sell",
  "buy-insurance": "Insure",
  "spin-to-win": "Spin!",
  lawsuit: "Lawsuit",
  expense: "Expense",
  lottery: "Lottery",
  "retire-choice": "Retire",
  blank: "—",
};

export function TheGameOfLifeFullGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<LifeFullState, LifeFullSettings>): JSX.Element {
  const t = isTerminal(state);
  const endedRef = useRef(false);
  useEffect(() => {
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [t, onGameOver]);

  const [spinDisplay, setSpinDisplay] = useState<number>(1);
  const [spinning, setSpinning] = useState(false);
  const dispatchRef = useRef(dispatch);
  dispatchRef.current = dispatch;

  // CPU auto-drive: when active=cpu, drive cpu-step with delay until phase
  // returns to human or game over.
  useEffect(() => {
    if (state.active === "cpu" && state.phase !== "done") {
      const id = window.setTimeout(() => {
        dispatchRef.current({ type: "cpu-step" } as LifeFullAction);
      }, 650);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [state.active, state.phase, state.turn, state.human.pos, state.cpu.pos, state.human.cash, state.cpu.cash]);

  function onSpin(): void {
    if (spinning || state.phase !== "spinning") return;
    setSpinning(true);
    const dur = 600;
    const start = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(1, (now - start) / dur);
      setSpinDisplay(1 + Math.floor(Math.random() * 10));
      if (dt < 1) {
        window.setTimeout(() => requestAnimationFrame(tick), 60 + dt * 80);
      } else {
        dispatchRef.current({ type: "spin" } as LifeFullAction);
        setSpinning(false);
      }
    };
    requestAnimationFrame(tick);
  }

  // Sync spin display to actual last spin
  useEffect(() => {
    const player = state.active === "human" ? state.human : state.cpu;
    if (player.lastSpin > 0) setSpinDisplay(player.lastSpin);
  }, [state.active, state.human.lastSpin, state.cpu.lastSpin]);

  const active = state.active === "human" ? state.human : state.cpu;
  const isHumanTurn = state.active === "human";

  return (
    <div className="lifefull-wrap fade-in">
      {/* Header */}
      <div className="lifefull-header">
        <h2 className="lifefull-title">The Game of Life (Full)</h2>
        <div className="lifefull-turn-indicator">
          Turn {state.turn} — <b className={isHumanTurn ? "lifefull-you" : "lifefull-cpu"}>
            {isHumanTurn ? "YOUR TURN" : "CPU's turn"}
          </b>
        </div>
      </div>

      {/* Side-by-side player panels */}
      <div className="lifefull-players">
        <PlayerPanel
          player={state.human}
          isActive={isHumanTurn}
          name="YOU"
          className="lifefull-player-human"
        />
        <PlayerPanel
          player={state.cpu}
          isActive={!isHumanTurn}
          name="CPU"
          className="lifefull-player-cpu"
        />
      </div>

      {/* Board strip */}
      <div className="lifefull-board" role="grid" aria-label="Life board">
        {BOARD.map((sq, i) => {
          const humanHere = state.human.pos === i;
          const cpuHere = state.cpu.pos === i;
          return (
            <div
              key={i}
              className={`lifefull-cell lifefull-${sq.kind}`}
              title={`${i + 1}. ${sq.label}`}
            >
              <span className="lifefull-cell-num">{i + 1}</span>
              <span className="lifefull-cell-kind">{KIND_LABEL[sq.kind] ?? sq.kind}</span>
              <span className="lifefull-cell-label">{sq.label}</span>
              <span className="lifefull-cell-tokens">
                {humanHere && <span className="lifefull-token lifefull-token-human" aria-label="your token">YOU</span>}
                {cpuHere && <span className="lifefull-token lifefull-token-cpu" aria-label="cpu token">CPU</span>}
              </span>
            </div>
          );
        })}
      </div>

      {/* Action panel */}
      <div className="lifefull-action">
        {/* Spinner */}
        <div className={`lifefull-spinner${spinning ? " lifefull-spinner-rolling" : ""}`}>
          <div className="lifefull-spinner-ring" aria-hidden="true" />
          <div className="lifefull-spinner-num">{spinDisplay}</div>
          <div className="lifefull-spinner-label">{spinning ? "spinning..." : "1-10"}</div>
        </div>

        {/* Decision UI per phase */}
        <div className="lifefull-controls">
          {renderControls(state, isHumanTurn, onSpin, spinning, dispatch)}
        </div>
      </div>

      {/* Event log */}
      <div className="lifefull-log">
        <div className="lifefull-log-title">Life Events</div>
        {state.log.length === 0 ? (
          <div className="lifefull-log-empty">Pick career or college to begin.</div>
        ) : (
          <ol className="lifefull-log-list">
            {state.log.map((e, i) => (
              <li key={state.log.length - i} className={`lifefull-log-row lifefull-log-${e.who}`}>
                <span className="lifefull-log-turn">T{e.turn}</span>
                <span className="lifefull-log-who">{e.who === "human" ? "You" : "CPU"}</span>
                {e.spin !== null && <span className="lifefull-log-spin">[{e.spin}]</span>}
                <span className="lifefull-log-label">{e.label}</span>
                {e.cashDelta !== 0 && (
                  <span className={`lifefull-log-delta ${e.cashDelta >= 0 ? "lifefull-pos" : "lifefull-neg"}`}>
                    {e.cashDelta >= 0 ? "+" : ""}${e.cashDelta}k
                  </span>
                )}
                {e.note && <span className="lifefull-log-note">{e.note}</span>}
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Game-over panel */}
      {state.phase === "done" && (
        <div className="lifefull-done bounce-in">
          <div className="lifefull-done-title">
            {finalScore(state.human) >= finalScore(state.cpu) ? "You Win!" : "CPU Wins!"}
          </div>
          <div className="lifefull-done-grid">
            <ScoreCard label="Your Final Score" player={state.human} />
            <ScoreCard label="CPU Final Score" player={state.cpu} />
          </div>
          <div className="lifefull-done-score pulse">Life Score: {finalScore(state.human)}</div>
        </div>
      )}
    </div>
  );
}

function PlayerPanel({
  player,
  isActive,
  name,
  className,
}: {
  player: PlayerLifeState;
  isActive: boolean;
  name: string;
  className: string;
}): JSX.Element {
  return (
    <div className={`lifefull-player ${className}${isActive ? " lifefull-player-active" : ""}${player.retired ? " lifefull-player-retired" : ""}`}>
      <div className="lifefull-player-head">
        <span className="lifefull-player-name">{name}</span>
        {player.retired && <span className="lifefull-player-badge">Retired</span>}
      </div>
      <div className="lifefull-player-stats">
        <div className="lifefull-stat lifefull-stat-cash">
          <span className="lifefull-stat-label">Cash</span>
          <span className="lifefull-stat-value">${player.cash}k</span>
        </div>
        {player.debt > 0 && (
          <div className="lifefull-stat lifefull-stat-debt">
            <span className="lifefull-stat-label">Debt</span>
            <span className="lifefull-stat-value">${player.debt}k</span>
          </div>
        )}
        <div className="lifefull-stat">
          <span className="lifefull-stat-label">House</span>
          <span className="lifefull-stat-value">{player.hasHouse ? `$${player.houseValue}k` : "—"}</span>
        </div>
        <div className="lifefull-stat">
          <span className="lifefull-stat-label">Family</span>
          <span className="lifefull-stat-value">
            {player.married ? "M" : "S"}/{player.kids}
          </span>
        </div>
        <div className="lifefull-stat">
          <span className="lifefull-stat-label">Career</span>
          <span className="lifefull-stat-value">
            {player.career ? `${player.career.name} $${player.career.salary}k` : (player.collegeTurnsLeft > 0 ? `College (${player.collegeTurnsLeft})` : "—")}
          </span>
        </div>
        <div className="lifefull-stat">
          <span className="lifefull-stat-label">Insurance</span>
          <span className="lifefull-stat-value">
            {player.insurance.auto ? "A" : "·"}/{player.insurance.home ? "H" : "·"}/{player.insurance.life ? "L" : "·"}
          </span>
        </div>
        <div className="lifefull-stat">
          <span className="lifefull-stat-label">Square</span>
          <span className="lifefull-stat-value">{player.pos === -1 ? "Pre" : player.pos + 1}</span>
        </div>
      </div>
    </div>
  );
}

function ScoreCard({ label, player }: { label: string; player: PlayerLifeState }): JSX.Element {
  return (
    <div className="lifefull-scorecard">
      <div className="lifefull-scorecard-label">{label}</div>
      <div className="lifefull-scorecard-line">Cash: <b>${player.cash}k</b></div>
      <div className="lifefull-scorecard-line">House: <b>${player.houseValue}k</b></div>
      <div className="lifefull-scorecard-line">Debt: <b>-${player.debt}k</b></div>
      <div className="lifefull-scorecard-line">Family bonus: <b>+${player.kids * 10 + (player.married ? 20 : 0)}k</b></div>
      <div className="lifefull-scorecard-line">Paydays: <b>+${player.paydayCount * 5}k</b></div>
      <div className="lifefull-scorecard-line">
        Retirement: <b>{player.retirementChoice === "millionaire-estates" ? "Millionaire Estates" : player.retirementChoice === "countryside-acres" ? "Countryside Acres" : "—"}</b>
      </div>
      <div className="lifefull-scorecard-total">Total: ${finalScore(player)}k</div>
    </div>
  );
}

function renderControls(
  state: LifeFullState,
  isHumanTurn: boolean,
  onSpin: () => void,
  spinning: boolean,
  dispatch: (a: unknown) => void,
): JSX.Element {
  if (state.phase === "done") {
    return <div className="lifefull-msg">Game over.</div>;
  }

  // CPU turn → show waiting indicator (cpu-step is auto-driven)
  if (!isHumanTurn) {
    return (
      <div className="lifefull-cpu-think">
        <div className="lifefull-cpu-think-dot" />
        CPU is making decisions…
      </div>
    );
  }

  // Human turn controls
  switch (state.phase) {
    case "choose-path":
      return (
        <div className="lifefull-choice">
          <div className="lifefull-choice-title">Start of Life — choose your path:</div>
          <div className="lifefull-choice-row">
            <button
              type="button"
              className="lifefull-btn lifefull-btn-primary"
              data-testid="lifefull-choose-career"
              title="Skip college, pick a normal-salary career and start playing immediately."
              onClick={() => dispatch({ type: "choose-path", path: "career" } as LifeFullAction)}
            >
              Career (skip college)
            </button>
            <button
              type="button"
              className="lifefull-btn lifefull-btn-secondary"
              data-testid="lifefull-choose-college"
              title="Take +$100k debt and lose 4 turns, but draw from higher-salary college careers."
              onClick={() => dispatch({ type: "choose-path", path: "college" } as LifeFullAction)}
            >
              College (+$100k debt, lose 4 turns)
            </button>
          </div>
        </div>
      );

    case "decision-career": {
      const opts = state.decisionData.careerOptions ?? [];
      return (
        <div className="lifefull-choice">
          <div className="lifefull-choice-title">Pick your career:</div>
          <div className="lifefull-choice-row">
            {opts.map((c, i) => (
              <button
                key={c.name}
                type="button"
                className="lifefull-btn lifefull-btn-career"
                data-testid={`lifefull-career-${i}`}
                title={`Become a ${c.name}. Salary $${c.salary}k per payday.`}
                onClick={() => dispatch({ type: "pick-career", index: i } as LifeFullAction)}
              >
                {c.name}<br /><small>${c.salary}k/payday</small>
              </button>
            ))}
          </div>
        </div>
      );
    }

    case "spinning":
      return (
        <button
          type="button"
          className="lifefull-btn lifefull-btn-primary lifefull-btn-big"
          data-testid="lifefull-spin"
          title="Spin the spinner to advance 1-10 squares."
          aria-label="Spin spinner"
          onClick={onSpin}
          disabled={spinning}
        >
          {spinning ? "Spinning…" : "SPIN!"}
        </button>
      );

    case "resolved":
      return (
        <button
          type="button"
          className="lifefull-btn lifefull-btn-primary"
          data-testid="lifefull-next"
          title="End your turn and pass to the CPU."
          onClick={() => dispatch({ type: "next" } as LifeFullAction)}
        >
          Next →
        </button>
      );

    case "decision-marry":
      return (
        <div className="lifefull-choice">
          <div className="lifefull-choice-title">You got married! Spin for your wedding gift:</div>
          <button
            type="button"
            className="lifefull-btn lifefull-btn-primary"
            data-testid="lifefull-marry-spin"
            title="Spin: 1-5 gets $50k, 6-10 gets $100k."
            onClick={() => dispatch({ type: "marry-spin" } as LifeFullAction)}
          >
            Spin for gift
          </button>
        </div>
      );

    case "decision-house": {
      const price = state.decisionData.houseValue ?? 100;
      return (
        <div className="lifefull-choice">
          <div className="lifefull-choice-title">House for sale: ${price}k. Buy?</div>
          <div className="lifefull-choice-row">
            <button
              type="button"
              className="lifefull-btn lifefull-btn-primary"
              data-testid="lifefull-house-buy"
              title={`Pay $${price}k for a house worth $${price}k.`}
              onClick={() => dispatch({ type: "buy-house", buy: true } as LifeFullAction)}
            >
              Buy for ${price}k
            </button>
            <button
              type="button"
              className="lifefull-btn lifefull-btn-secondary"
              data-testid="lifefull-house-skip"
              title="Skip this house offer."
              onClick={() => dispatch({ type: "buy-house", buy: false } as LifeFullAction)}
            >
              Decline
            </button>
          </div>
        </div>
      );
    }

    case "decision-sell": {
      const price = state.decisionData.salePrice ?? 100;
      return (
        <div className="lifefull-choice">
          <div className="lifefull-choice-title">Offer on your house: ${price}k. Sell?</div>
          <div className="lifefull-choice-row">
            <button
              type="button"
              className="lifefull-btn lifefull-btn-primary"
              data-testid="lifefull-sell-yes"
              title={`Sell your house for $${price}k cash.`}
              onClick={() => dispatch({ type: "sell-house", sell: true } as LifeFullAction)}
            >
              Sell for ${price}k
            </button>
            <button
              type="button"
              className="lifefull-btn lifefull-btn-secondary"
              data-testid="lifefull-sell-no"
              title="Keep your current house."
              onClick={() => dispatch({ type: "sell-house", sell: false } as LifeFullAction)}
            >
              Keep house
            </button>
          </div>
        </div>
      );
    }

    case "decision-insurance": {
      const kind = state.decisionData.insuranceKind ?? "auto";
      const cost = state.decisionData.insuranceCost ?? 0;
      return (
        <div className="lifefull-choice">
          <div className="lifefull-choice-title">Buy {kind} insurance for ${cost}k?</div>
          <div className="lifefull-choice-row">
            <button
              type="button"
              className="lifefull-btn lifefull-btn-primary"
              data-testid="lifefull-insurance-yes"
              title={`Pay $${cost}k for ${kind} insurance — halves future lawsuit losses.`}
              onClick={() => dispatch({ type: "buy-insurance", buy: true } as LifeFullAction)}
            >
              Buy
            </button>
            <button
              type="button"
              className="lifefull-btn lifefull-btn-secondary"
              data-testid="lifefull-insurance-no"
              title="Skip this insurance offer."
              onClick={() => dispatch({ type: "buy-insurance", buy: false } as LifeFullAction)}
            >
              Decline
            </button>
          </div>
        </div>
      );
    }

    case "decision-spin-win":
      return (
        <div className="lifefull-choice">
          <div className="lifefull-choice-title">Spin to Win! Pay $50k, win $200k on 6-10:</div>
          <div className="lifefull-choice-row">
            <button
              type="button"
              className="lifefull-btn lifefull-btn-primary"
              data-testid="lifefull-spinwin-play"
              title="Pay $50k for a 50% chance at $200k."
              onClick={() => dispatch({ type: "play-spin-to-win", play: true } as LifeFullAction)}
            >
              Play
            </button>
            <button
              type="button"
              className="lifefull-btn lifefull-btn-secondary"
              data-testid="lifefull-spinwin-skip"
              title="Skip the spin-to-win game."
              onClick={() => dispatch({ type: "play-spin-to-win", play: false } as LifeFullAction)}
            >
              Pass
            </button>
          </div>
        </div>
      );

    case "decision-retire":
      return (
        <div className="lifefull-choice">
          <div className="lifefull-choice-title">Pick your retirement community:</div>
          <div className="lifefull-choice-row">
            <button
              type="button"
              className="lifefull-btn lifefull-btn-primary"
              data-testid="lifefull-retire-millionaire"
              title="High-stakes: +$200k bonus if you have ≥$1000k cash, else $0 bonus."
              onClick={() => dispatch({ type: "pick-retirement", choice: "millionaire-estates" } as LifeFullAction)}
            >
              Millionaire Estates<br /><small>+$200k if $1M+, else $0</small>
            </button>
            <button
              type="button"
              className="lifefull-btn lifefull-btn-secondary"
              data-testid="lifefull-retire-countryside"
              title="Safe: guaranteed +$100k bonus."
              onClick={() => dispatch({ type: "pick-retirement", choice: "countryside-acres" } as LifeFullAction)}
            >
              Countryside Acres<br /><small>+$100k guaranteed</small>
            </button>
          </div>
        </div>
      );

    default:
      return <div className="lifefull-msg">Waiting…</div>;
  }
}
