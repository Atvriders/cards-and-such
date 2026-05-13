import { useEffect, useMemo, useRef, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RiskFullState, RiskFullAction, RiskFullSettings, Card } from "./state.js";
import {
  isTerminal, score, TERRITORIES, ADJ, CONTINENTS, N_TERR,
  cardSetValue, isValidSet, findValidSet, continentBonus, isConnectedFriendly,
} from "./state.js";
import "./Game.css";

const MAP_W = 960;
const MAP_H = 540;

const CONT_COLOR: Record<string, string> = {
  na: "#7ec8a1", sa: "#d8a05c", eu: "#a8c2e8", af: "#dccb6b", as: "#d28aa9", au: "#c79074",
};

function Die({ value, who }: { value: number; who: "att" | "def" }): JSX.Element {
  return (
    <div className={`riskfull-die riskfull-die-${who}`} aria-label={`${who === "att" ? "attacker" : "defender"} rolled ${value}`}>
      {value}
    </div>
  );
}

function CardChip({ card, selected, onClick, owned, idx }: {
  card: Card; selected: boolean; onClick: () => void; owned: boolean; idx: number;
}): JSX.Element {
  const label = card.kind === "wild" ? "WILD" : card.kind.toUpperCase();
  const terrName = card.terr >= 0 ? TERRITORIES[card.terr]!.name : "—";
  return (
    <button
      className={`riskfull-card ${selected ? "riskfull-card-selected" : ""} riskfull-card-${card.kind}`}
      onClick={onClick}
      data-testid={`riskfull-card-${idx}`}
      title={`${label} • ${terrName}${owned ? " (you own this — +2 bonus if traded)" : ""}`}
      aria-label={`${label} card from ${terrName}${selected ? " (selected)" : ""}`}
    >
      <span className="riskfull-card-kind">{label}</span>
      <span className="riskfull-card-terr">{terrName}</span>
      {owned && <span className="riskfull-card-own">+2</span>}
    </button>
  );
}

export function RiskFullGame({ state, dispatch, onGameOver }: GameProps<RiskFullState, RiskFullSettings>): JSX.Element {
  const t = isTerminal(state);
  const endedRef = useRef(false);
  useEffect(() => {
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [t, onGameOver]);

  const [fortifyAmt, setFortifyAmt] = useState(1);
  const [conquestAmt, setConquestAmt] = useState(0);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);

  // Auto-run CPU phase
  useEffect(() => {
    if (state.phase === "cpu") {
      const id = setTimeout(() => dispatch({ type: "cpu" } as RiskFullAction), 700);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [state.phase, dispatch]);

  // Reset selection when phase changes
  useEffect(() => {
    setSelectedCards([]);
  }, [state.phase, state.turn]);

  const pTerritories = state.owner.filter(o => o === "p").length;
  const cTerritories = state.owner.filter(o => o === "c").length;
  const pArmies = state.armies.reduce((s, a, i) => s + (state.owner[i] === "p" ? a : 0), 0);
  const cArmies = state.armies.reduce((s, a, i) => s + (state.owner[i] === "c" ? a : 0), 0);

  const phaseLabel = useMemo(() => {
    switch (state.phase) {
      case "place-initial":
      case "reinforce":
      case "trade":
        return "Reinforce";
      case "attack-from":
      case "attack-to":
      case "attack-roll":
        return "Attack";
      case "post-conquest":
        return "Move Armies";
      case "fortify-from":
      case "fortify-to":
      case "fortify-amount":
        return "Fortify";
      case "cpu":
        return "CPU Turn";
      case "done":
        return "Game Over";
    }
  }, [state.phase]);

  const pContBonus = useMemo(() => continentBonus(state, "p"), [state]);
  const cContBonus = useMemo(() => continentBonus(state, "c"), [state]);

  const isClickable = (i: number): boolean => {
    if (state.phase === "done" || state.phase === "cpu" || state.phase === "post-conquest") return false;
    if (state.phase === "reinforce") return state.owner[i] === "p";
    if (state.phase === "attack-from") return state.owner[i] === "p" && state.armies[i]! >= 2;
    if (state.phase === "attack-to") {
      if (state.owner[i] === "p") return state.armies[i]! >= 2;
      if (state.selected === null) return false;
      return ADJ[state.selected]!.includes(i);
    }
    if (state.phase === "attack-roll") return false;
    if (state.phase === "fortify-from") return state.owner[i] === "p" && state.armies[i]! >= 2;
    if (state.phase === "fortify-to") {
      if (state.owner[i] === "p") {
        if (i === state.selected) return false;
        if (state.selected !== null && isConnectedFriendly(state, state.selected, i)) return true;
        return state.armies[i]! >= 2;  // re-pick source
      }
      return false;
    }
    if (state.phase === "fortify-amount") return false;
    return false;
  };

  const onTerrClick = (i: number): void => {
    if (!isClickable(i)) return;
    if (state.phase === "reinforce") {
      dispatch({ type: "placeOn", idx: i } as RiskFullAction);
      return;
    }
    dispatch({ type: "select", idx: i } as RiskFullAction);
  };

  const toggleCardSelection = (idx: number): void => {
    setSelectedCards(prev => {
      if (prev.includes(idx)) return prev.filter(x => x !== idx);
      if (prev.length >= 3) return [prev[1]!, prev[2]!, idx];
      return [...prev, idx];
    });
  };

  const canTradeSet = useMemo(() => {
    if (selectedCards.length !== 3) return false;
    const cards = selectedCards.map(i => state.cards.p[i]!).filter(Boolean);
    return isValidSet(cards);
  }, [selectedCards, state.cards.p]);

  const autoTrade = (): void => {
    const idx = findValidSet(state.cards.p);
    if (idx) {
      dispatch({ type: "trade", indices: idx as [number, number, number] } as RiskFullAction);
      setSelectedCards([]);
    }
  };

  const submitTrade = (): void => {
    if (!canTradeSet) return;
    const sorted = [...selectedCards].sort((a, b) => a - b) as [number, number, number];
    dispatch({ type: "trade", indices: sorted } as RiskFullAction);
    setSelectedCards([]);
  };

  // Connectivity preview for fortify (BFS chains)
  const fortifyReachable = useMemo<Set<number>>(() => {
    if (state.phase !== "fortify-to" || state.selected === null) return new Set();
    const out = new Set<number>();
    for (let i = 0; i < N_TERR; i++) {
      if (i === state.selected) continue;
      if (state.owner[i] !== "p") continue;
      if (isConnectedFriendly(state, state.selected, i)) out.add(i);
    }
    return out;
  }, [state]);

  const fortifyMax = state.selected !== null ? Math.max(1, state.armies[state.selected]! - 1) : 1;
  const fortifyAmtClamped = Math.min(fortifyAmt, fortifyMax);

  const conquestFrom = state.pendingConquest?.from ?? -1;
  const conquestTo = state.pendingConquest?.to ?? -1;
  const conquestMin = state.pendingConquest?.min ?? 1;
  const conquestMax = conquestFrom >= 0 ? Math.max(conquestMin, state.armies[conquestFrom]! - 1) : conquestMin;
  useEffect(() => {
    if (state.pendingConquest) setConquestAmt(state.pendingConquest.min);
  }, [state.pendingConquest]);
  const conquestClamped = Math.max(conquestMin, Math.min(conquestAmt, conquestMax));

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (state.phase === "attack-roll" && (e.key === "r" || e.key === "R")) {
        e.preventDefault(); dispatch({ type: "rollAttack" } as RiskFullAction);
      } else if (state.phase === "reinforce" && (e.key === "n" || e.key === "N")) {
        e.preventDefault(); dispatch({ type: "endReinforce" } as RiskFullAction);
      } else if ((state.phase === "attack-from" || state.phase === "attack-to") && (e.key === "n" || e.key === "N" || e.key === "Escape")) {
        e.preventDefault(); dispatch({ type: "endAttack" } as RiskFullAction);
      } else if ((state.phase === "fortify-from" || state.phase === "fortify-to" || state.phase === "fortify-amount") && (e.key === "n" || e.key === "N" || e.key === "Escape")) {
        e.preventDefault(); dispatch({ type: "endFortify" } as RiskFullAction);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dispatch, state.phase]);

  // Adjacency overlay lines (skip crazy long ocean lines for clarity)
  const lines = useMemo(() => {
    const out: Array<{ x1: number; y1: number; x2: number; y2: number; key: string; wraps: boolean }> = [];
    for (let a = 0; a < ADJ.length; a++) {
      for (const b of ADJ[a]!) {
        if (b <= a) continue;
        const A = TERRITORIES[a]!;
        const B = TERRITORIES[b]!;
        // Skip the Alaska↔Kamchatka wrap-around — would draw across the entire map.
        const wraps = (a === 0 && b === 29);
        if (wraps) continue;
        out.push({
          x1: A.x * MAP_W, y1: A.y * MAP_H,
          x2: B.x * MAP_W, y2: B.y * MAP_H,
          key: `${a}-${b}`,
          wraps: false,
        });
      }
    }
    return out;
  }, []);

  return (
    <div className="riskfull-wrap gs-fade-in">
      <div className="riskfull-hud">
        <div className="riskfull-hud-row">
          <div className="riskfull-phase-pill" data-phase={state.phase}>
            <span className="riskfull-phase-label">{phaseLabel}</span>
            <span className="riskfull-turn">Turn {state.turn}</span>
          </div>
          {state.phase === "reinforce" && state.reserve > 0 && (
            <div className="riskfull-reserve">
              <span className="riskfull-reserve-label">Reserve</span>
              <span className="riskfull-reserve-count">{state.reserve}</span>
            </div>
          )}
          <div className="riskfull-set-value" title="Next card-set trade value">
            <span className="riskfull-set-label">Next Set</span>
            <span className="riskfull-set-num">+{cardSetValue(state.tradeIndex)}</span>
          </div>
        </div>

        <div className="riskfull-tally">
          <div className="riskfull-tally-side riskfull-tally-p">
            <span className="riskfull-tally-name">YOU</span>
            <span className="riskfull-tally-num">{pTerritories} terr</span>
            <span className="riskfull-tally-num">{pArmies} armies</span>
            <span className="riskfull-tally-num">{state.cards.p.length} cards</span>
            {pContBonus > 0 && <span className="riskfull-tally-bonus">+{pContBonus} bonus</span>}
          </div>
          <div className="riskfull-tally-vs gs-pulse">vs</div>
          <div className="riskfull-tally-side riskfull-tally-c">
            <span className="riskfull-tally-name">CRIMSON EMPIRE</span>
            <span className="riskfull-tally-num">{cTerritories} terr</span>
            <span className="riskfull-tally-num">{cArmies} armies</span>
            <span className="riskfull-tally-num">{state.cards.c.length} cards</span>
            {cContBonus > 0 && <span className="riskfull-tally-bonus">+{cContBonus} bonus</span>}
          </div>
        </div>
      </div>

      <div className="riskfull-message">{state.message}</div>

      {/* Map */}
      <div className="riskfull-map" role="grid">
        <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="riskfull-svg" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="riskfull-bg-grad" cx="50%" cy="50%" r="80%">
              <stop offset="0%" stopColor="#0d1d3e" />
              <stop offset="100%" stopColor="#050a1a" />
            </radialGradient>
            <pattern id="riskfull-water" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 20 Q10 10 20 20 T40 20" stroke="#1b3a6c" strokeWidth="1" fill="none" opacity="0.5" />
            </pattern>
          </defs>
          <rect x="0" y="0" width={MAP_W} height={MAP_H} fill="url(#riskfull-bg-grad)" />
          <rect x="0" y="0" width={MAP_W} height={MAP_H} fill="url(#riskfull-water)" />

          {/* Continent labels (drawn first, behind territories) */}
          {CONTINENTS.map(c => {
            const terrs = TERRITORIES.filter(t => t.cont === c.id);
            const cx = terrs.reduce((s, t) => s + t.x, 0) / terrs.length;
            const cy = terrs.reduce((s, t) => s + t.y, 0) / terrs.length;
            return (
              <text
                key={c.id}
                x={cx * MAP_W}
                y={cy * MAP_H - 60}
                className="riskfull-cont-label"
                textAnchor="middle"
                fill={CONT_COLOR[c.id]}
              >
                {c.name} (+{c.bonus})
              </text>
            );
          })}

          {/* Adjacency lines */}
          {lines.map(l => (
            <line key={l.key} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
              className="riskfull-link" strokeDasharray="4 6" />
          ))}

          {/* Territories */}
          {state.armies.map((a, i) => {
            const T = TERRITORIES[i]!;
            const cx = T.x * MAP_W, cy = T.y * MAP_H;
            const isSel = state.selected === i;
            const isTgt = state.target === i;
            const clickable = isClickable(i);
            const reachable = fortifyReachable.has(i);
            const ownerCls = state.owner[i] === "p" ? "riskfull-terr-p" : "riskfull-terr-c";
            const stateCls = isSel ? "riskfull-terr-selected" : isTgt ? "riskfull-terr-target" : reachable ? "riskfull-terr-reachable" : "";
            const interactCls = clickable ? "riskfull-terr-clickable" : "";
            const contColor = CONT_COLOR[T.cont] ?? "#888";
            return (
              <g key={i} className={`riskfull-terr ${ownerCls} ${stateCls} ${interactCls}`}
                onClick={() => onTerrClick(i)}
                onKeyDown={(e) => { if (clickable && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onTerrClick(i); } }}
                tabIndex={clickable ? 0 : -1}
                role={clickable ? "button" : "gridcell"}
                aria-label={`${T.name} (${CONTINENTS.find(c => c.id === T.cont)!.name}), ${state.owner[i] === "p" ? "yours" : "CPU"}, ${a} armies${clickable ? " (press Enter)" : ""}`}
                data-testid={`riskfull-terr-${i}`}
              >
                <circle cx={cx} cy={cy} r={20} className="riskfull-terr-base" style={{ fill: contColor }} />
                <circle cx={cx} cy={cy} r={14} className="riskfull-terr-army-bg" />
                <text x={cx} y={cy - 24} className="riskfull-terr-name" textAnchor="middle">
                  {T.name}
                </text>
                <text x={cx} y={cy + 5} className="riskfull-terr-armies" textAnchor="middle">
                  {a}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Card hand panel */}
      {state.cards.p.length > 0 && state.phase === "reinforce" && (
        <div className="riskfull-cards">
          <div className="riskfull-cards-title">Your Cards ({state.cards.p.length}/5)</div>
          <div className="riskfull-cards-list">
            {state.cards.p.map((card, i) => (
              <CardChip
                key={i}
                idx={i}
                card={card}
                owned={card.terr >= 0 && state.owner[card.terr] === "p"}
                selected={selectedCards.includes(i)}
                onClick={() => toggleCardSelection(i)}
              />
            ))}
          </div>
          <div className="riskfull-cards-actions">
            <button
              className="riskfull-btn riskfull-btn-primary"
              disabled={!canTradeSet}
              onClick={submitTrade}
              title="Trade the three selected cards for armies"
            >
              Trade Selected (+{cardSetValue(state.tradeIndex)})
            </button>
            <button
              className="riskfull-btn riskfull-btn-ghost"
              onClick={autoTrade}
              disabled={findValidSet(state.cards.p) === null}
              title="Auto-pick a valid set"
            >
              Auto-Trade
            </button>
            {state.cards.p.length >= 5 && (
              <span className="riskfull-cards-force">5+ cards — you must trade!</span>
            )}
          </div>
        </div>
      )}

      {/* Dice */}
      {(state.attackerDice.length > 0 || state.phase === "attack-roll") && (
        <div className="riskfull-dice-panel">
          <div className="riskfull-dice-row">
            <span className="riskfull-dice-label riskfull-dice-label-att">Attacker</span>
            <div className="riskfull-dice-set">
              {state.attackerDice.length > 0
                ? state.attackerDice.map((d, i) => <Die key={`a${i}`} value={d} who="att" />)
                : <span className="riskfull-dice-pending">— roll to see —</span>}
            </div>
          </div>
          <div className="riskfull-dice-row">
            <span className="riskfull-dice-label riskfull-dice-label-def">Defender</span>
            <div className="riskfull-dice-set">
              {state.defenderDice.length > 0
                ? state.defenderDice.map((d, i) => <Die key={`d${i}`} value={d} who="def" />)
                : <span className="riskfull-dice-pending">— roll to see —</span>}
            </div>
          </div>
          {state.lastAttackLoss && (
            <div className="riskfull-dice-result">
              You lost <strong>{state.lastAttackLoss.att}</strong>, CPU lost <strong>{state.lastAttackLoss.def}</strong>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="riskfull-actions">
        {state.phase === "reinforce" && (
          <button
            className="riskfull-btn riskfull-btn-ghost"
            onClick={() => dispatch({ type: "endReinforce" } as RiskFullAction)}
            title="Auto-place remaining and continue"
          >
            {state.reserve > 0 ? `Auto-place ${state.reserve} & Continue` : "Continue to Attack"}
          </button>
        )}
        {state.phase === "attack-from" && (
          <button
            className="riskfull-btn riskfull-btn-ghost"
            onClick={() => dispatch({ type: "endAttack" } as RiskFullAction)}
            title="Skip attack and go to fortify"
          >
            Skip Attack → Fortify
          </button>
        )}
        {state.phase === "attack-to" && (
          <button
            className="riskfull-btn riskfull-btn-ghost"
            onClick={() => dispatch({ type: "endAttack" } as RiskFullAction)}
            title="Cancel attack selection"
          >
            Cancel & End Attack
          </button>
        )}
        {state.phase === "attack-roll" && (
          <>
            <button
              className="riskfull-btn riskfull-btn-attack riskfull-btn-primary"
              onClick={() => dispatch({ type: "rollAttack" } as RiskFullAction)}
              title="Roll the dice (press R)"
            >
              Roll Dice & Attack!
            </button>
            <button
              className="riskfull-btn riskfull-btn-ghost"
              onClick={() => dispatch({ type: "endAttack" } as RiskFullAction)}
              title="Cancel this attack"
            >
              Cancel
            </button>
          </>
        )}
        {state.phase === "post-conquest" && state.pendingConquest && (
          <div className="riskfull-conquest-amt">
            <label>Move into {TERRITORIES[conquestTo]!.name}:</label>
            <input
              type="range"
              min={conquestMin}
              max={conquestMax}
              value={conquestClamped}
              onChange={(e) => setConquestAmt(Number(e.target.value))}
              aria-label="armies to move"
            />
            <span className="riskfull-conquest-num">{conquestClamped}</span>
            <button
              className="riskfull-btn riskfull-btn-primary"
              onClick={() => dispatch({ type: "moveAfterConquest", amount: conquestClamped } as RiskFullAction)}
              title={`Move ${conquestClamped} armies in`}
            >
              Move {conquestClamped} →
            </button>
          </div>
        )}
        {state.phase === "fortify-from" && (
          <button
            className="riskfull-btn riskfull-btn-ghost"
            onClick={() => dispatch({ type: "endFortify" } as RiskFullAction)}
            title="Skip fortify and end your turn"
          >
            Skip Fortify → End Turn
          </button>
        )}
        {state.phase === "fortify-to" && (
          <button
            className="riskfull-btn riskfull-btn-ghost"
            onClick={() => dispatch({ type: "endFortify" } as RiskFullAction)}
            title="End your turn now"
          >
            End Turn
          </button>
        )}
        {state.phase === "fortify-amount" && state.selected !== null && state.target !== null && (
          <div className="riskfull-fortify-amt">
            <label>Move</label>
            <input
              type="range"
              min={1}
              max={fortifyMax}
              value={fortifyAmtClamped}
              onChange={(e) => setFortifyAmt(Number(e.target.value))}
              aria-label="armies to fortify"
            />
            <span className="riskfull-fortify-num">{fortifyAmtClamped}</span>
            <button
              className="riskfull-btn riskfull-btn-primary"
              onClick={() => dispatch({ type: "fortify", amount: fortifyAmtClamped } as RiskFullAction)}
              title={`Move ${fortifyAmtClamped} armies`}
            >
              Move {fortifyAmtClamped} → {TERRITORIES[state.target]!.name}
            </button>
            <button
              className="riskfull-btn riskfull-btn-ghost"
              onClick={() => dispatch({ type: "endFortify" } as RiskFullAction)}
              title="End turn without moving"
            >
              End Turn
            </button>
          </div>
        )}
        {state.phase === "cpu" && (
          <div className="riskfull-cpu-thinking">Crimson Empire is plotting...</div>
        )}
        {state.phase === "done" && (
          <div className="riskfull-done gs-bounce-in">
            <div className="riskfull-done-msg">{state.message}</div>
            <div className="riskfull-done-score">Score: {score(state)}</div>
          </div>
        )}
      </div>

      {/* Event log */}
      <div className="riskfull-log">
        <div className="riskfull-log-title">War Log</div>
        <ul>
          {state.log.map((entry, i) => (
            <li key={`${state.turn}-${i}`} className={i === 0 ? "riskfull-log-newest" : ""}>{entry}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
