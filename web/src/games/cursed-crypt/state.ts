import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type RoomType = "combat" | "trap" | "treasure" | "shrine" | "boss";

export interface CryptRoom {
  type: RoomType;
  title: string;
  description: string;
  choices: readonly RoomChoice[];
  resolved: boolean;
}

export interface RoomChoice {
  label: string;
  hpDelta: number;
  goldDelta: number;
  outcome: string;
}

export interface CursedCryptState {
  rngSeed: number;
  rooms: readonly CryptRoom[];
  currentRoom: number;
  playerHp: number;
  playerMaxHp: number;
  gold: number;
  phase: "explore" | "dead" | "escaped";
  log: readonly string[];
}

export type CursedCryptAction =
  | { type: "choose"; choiceIdx: number }
  | { type: "advance" };

const ROOM_TEMPLATES: Array<{ type: RoomType; title: string; description: string; choices: Array<{ label: string; hpDelta: number; goldDelta: number; outcome: string }> }> = [
  {
    type: "combat",
    title: "Skeleton Warrior",
    description: "A skeleton rises from a crumbling sarcophagus, sword raised!",
    choices: [
      { label: "Fight head-on", hpDelta: -8, goldDelta: 15, outcome: "You defeat the skeleton, taking a blow. +15 gold." },
      { label: "Dodge and strike", hpDelta: -3, goldDelta: 10, outcome: "Swift footwork saves you. +10 gold." },
    ],
  },
  {
    type: "trap",
    title: "Pressure Plate",
    description: "You notice the floor has suspiciously placed tiles...",
    choices: [
      { label: "Step carefully", hpDelta: 0, goldDelta: 0, outcome: "You navigate the trap safely." },
      { label: "Run through", hpDelta: -12, goldDelta: 5, outcome: "Blades slash you! But you find a coin. -12 HP." },
    ],
  },
  {
    type: "treasure",
    title: "Dusty Chest",
    description: "An old iron chest sits against the wall, padlocked.",
    choices: [
      { label: "Smash it open", hpDelta: -2, goldDelta: 25, outcome: "Scraped your hands but found riches! +25 gold." },
      { label: "Pick the lock", hpDelta: 0, goldDelta: 20, outcome: "Click! The chest opens cleanly. +20 gold." },
    ],
  },
  {
    type: "shrine",
    title: "Ancient Shrine",
    description: "A glowing shrine pulses with mystical energy.",
    choices: [
      { label: "Pray at shrine", hpDelta: 12, goldDelta: 0, outcome: "You feel restored. +12 HP." },
      { label: "Smash for loot", hpDelta: -5, goldDelta: 30, outcome: "Cursed! -5 HP, but took the offering. +30 gold." },
    ],
  },
  {
    type: "combat",
    title: "Vampire Bat Swarm",
    description: "A swarm of shrieking bats descends from the ceiling!",
    choices: [
      { label: "Torch them", hpDelta: -4, goldDelta: 8, outcome: "Burns a few, the rest scatter. +8 gold." },
      { label: "Take cover", hpDelta: -10, goldDelta: 0, outcome: "They bite repeatedly before you escape!" },
    ],
  },
  {
    type: "boss",
    title: "THE LICH",
    description: "The ancient Lich materializes from shadow — this is the final battle!",
    choices: [
      { label: "Attack fiercely", hpDelta: -20, goldDelta: 100, outcome: "After a brutal fight you prevail! +100 gold!" },
      { label: "Use holy relic", hpDelta: -5, goldDelta: 80, outcome: "The relic burns the Lich! +80 gold!" },
    ],
  },
];

function shuffleRooms(rng: () => number): CryptRoom[] {
  const non_boss = ROOM_TEMPLATES.filter(r => r.type !== "boss");
  const boss = ROOM_TEMPLATES.find(r => r.type === "boss")!;
  const shuffled = [...non_boss];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return [...shuffled, boss].map(r => ({ ...r, choices: r.choices, resolved: false }));
}

export function initialState(seed: number): CursedCryptState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const rng2 = mulberry32(nextSeed);
  return {
    rngSeed: nextSeed,
    rooms: shuffleRooms(rng2),
    currentRoom: 0,
    playerHp: 35,
    playerMaxHp: 35,
    gold: 0,
    phase: "explore",
    log: ["You enter the Cursed Crypt. Five rooms await..."],
  };
}

export function reducer(state: CursedCryptState, action: CursedCryptAction): CursedCryptState {
  if (state.phase !== "explore") return state;

  if (action.type === "choose") {
    const room = state.rooms[state.currentRoom];
    if (!room || room.resolved) return state;
    const choice = room.choices[action.choiceIdx];
    if (!choice) return state;

    let { playerHp, gold } = state;
    playerHp += choice.hpDelta;
    gold += choice.goldDelta;
    playerHp = Math.min(state.playerMaxHp, Math.max(0, playerHp));
    gold = Math.max(0, gold);

    const newRooms = state.rooms.map((r, i) => i === state.currentRoom ? { ...r, resolved: true } : r);
    let phase: CursedCryptState["phase"] = "explore";
    const logLines = [choice.outcome];

    if (playerHp <= 0) {
      phase = "dead";
      logLines.push("You succumbed to the crypt's curse!");
    }

    return { ...state, rooms: newRooms, playerHp, gold, phase, log: [...state.log, ...logLines] };
  }

  if (action.type === "advance") {
    const room = state.rooms[state.currentRoom];
    if (!room?.resolved) return state;
    const nextRoom = state.currentRoom + 1;
    if (nextRoom >= state.rooms.length) {
      return { ...state, currentRoom: nextRoom, phase: "escaped", log: [...state.log, "You escaped the Cursed Crypt!"] };
    }
    const nextRoomDef = state.rooms[nextRoom]!;
    return {
      ...state,
      currentRoom: nextRoom,
      log: [...state.log, `Room ${nextRoom + 1}: ${nextRoomDef.title}`],
    };
  }

  return state;
}

export function isTerminal(state: CursedCryptState): { score: number } | null {
  if (state.phase === "escaped") return { score: 50 + state.gold + state.playerHp };
  if (state.phase === "dead") return { score: Math.max(0, state.gold + state.currentRoom * 5) };
  return null;
}
