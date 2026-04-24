import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type CardKind = "fight" | "heal" | "gold" | "enemy" | "boss" | "empty";

export interface GridCard {
  id: number;
  kind: CardKind;
  value: number;
  label: string;
  revealed: boolean;
}

export interface CardCrawlerState {
  rngSeed: number;
  grid: readonly GridCard[];
  playerHp: number;
  playerMaxHp: number;
  gold: number;
  score: number;
  turnCount: number;
  phase: "playing" | "dead" | "cleared";
  log: readonly string[];
}

export type CardCrawlerAction = { type: "flip"; idx: number };

let _idCounter = 0;

function makeCard(kind: CardKind, value: number, label: string): GridCard {
  return { id: _idCounter++, kind, value, label, revealed: false };
}

function buildDeck(rng: () => number): GridCard[] {
  const cards: GridCard[] = [
    makeCard("fight",  8,  "Sword +8"),
    makeCard("fight",  12, "Axe +12"),
    makeCard("fight",  6,  "Dagger +6"),
    makeCard("fight",  15, "Hammer +15"),
    makeCard("heal",   10, "Potion +10hp"),
    makeCard("heal",   6,  "Herb +6hp"),
    makeCard("gold",   15, "Coins 15g"),
    makeCard("gold",   20, "Chest 20g"),
    makeCard("enemy",  8,  "Goblin -8hp"),
    makeCard("enemy",  12, "Orc -12hp"),
    makeCard("enemy",  6,  "Rat -6hp"),
    makeCard("enemy",  18, "Troll -18hp"),
    makeCard("boss",   30, "BOSS -30hp"),
    makeCard("empty",  0,  "Empty"),
    makeCard("empty",  0,  "Empty"),
    makeCard("fight",  10, "Spear +10"),
  ];
  // Fisher-Yates shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = cards[i]!;
    cards[i] = cards[j]!;
    cards[j] = tmp;
  }
  return cards;
}

export function initialState(seed: number): CardCrawlerState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const rng2 = mulberry32(nextSeed);
  return {
    rngSeed: nextSeed,
    grid: buildDeck(rng2),
    playerHp: 40,
    playerMaxHp: 40,
    gold: 0,
    score: 0,
    turnCount: 0,
    phase: "playing",
    log: ["Flip cards to fight, heal, or collect gold!"],
  };
}

export function reducer(state: CardCrawlerState, action: CardCrawlerAction): CardCrawlerState {
  if (state.phase !== "playing") return state;
  if (action.type !== "flip") return state;

  const { idx } = action;
  const card = state.grid[idx];
  if (!card || card.revealed) return state;

  const newGrid = state.grid.map((c, i) => i === idx ? { ...c, revealed: true } : c);
  const logLines: string[] = [];
  let { playerHp, gold, score } = state;

  switch (card.kind) {
    case "fight":
      score += card.value;
      logLines.push(`${card.label}: score +${card.value}`);
      break;
    case "heal":
      playerHp = Math.min(state.playerMaxHp, playerHp + card.value);
      logLines.push(`${card.label}: HP now ${playerHp}`);
      break;
    case "gold":
      gold += card.value;
      logLines.push(`${card.label}: gold now ${gold}`);
      break;
    case "enemy":
    case "boss":
      playerHp -= card.value;
      logLines.push(`${card.label}: took ${card.value} dmg, HP ${Math.max(0, playerHp)}`);
      break;
    case "empty":
      logLines.push("Empty room.");
      break;
  }

  const allRevealed = newGrid.every(c => c.revealed);
  let phase: CardCrawlerState["phase"] = state.phase;
  if (playerHp <= 0) {
    playerHp = 0;
    phase = "dead";
    logLines.push("You were slain!");
  } else if (allRevealed) {
    phase = "cleared";
    score += gold;
    logLines.push(`All cards revealed! Final score: ${score}`);
  }

  return {
    ...state,
    grid: newGrid,
    playerHp,
    gold,
    score,
    turnCount: state.turnCount + 1,
    phase,
    log: [...state.log, ...logLines],
  };
}

export function isTerminal(state: CardCrawlerState): { score: number } | null {
  if (state.phase === "cleared") return { score: state.score };
  if (state.phase === "dead") return { score: Math.max(0, state.score + state.gold - 10) };
  return null;
}
