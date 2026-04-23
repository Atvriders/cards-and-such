import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface RhymeTimeSettings {
  duration: "30" | "60";
  difficulty: "easy" | "medium" | "hard";
}

// Rhyme groups: words grouped by their ending sound
interface RhymeGroup {
  prompt: string;
  rhymes: string[];
  ending: string;
}

const RHYME_GROUPS: RhymeGroup[] = [
  { prompt: "cat", rhymes: ["bat","fat","hat","mat","pat","rat","sat","vat","flat","brat","chat","that","scat","spat","gnat"], ending: "at" },
  { prompt: "day", rhymes: ["bay","gay","hay","jay","lay","may","pay","ray","say","way","clay","gray","play","pray","slay","spray","stay","tray","away","decay","delay","display","hooray","okay","relay","repay","spray","stray","sway","today","essay","portray"], ending: "ay" },
  { prompt: "night", rhymes: ["bite","cite","fight","kite","light","might","quite","right","sight","tight","white","write","blight","bright","flight","fright","knight","plight","slight","sprite","brite","delight","ignite","invite","polite","recite","despite","excite","finite","frostbite","moonlight","sunlight","starlight","spotlight","unite","upright"], ending: "ight" },
  { prompt: "love", rhymes: ["above","dove","glove","shove","of","dove","from","come","some","drum","gum","hum","mum","rum","sum","bum","dumb","crumb","numb","plum","scum","slim","swim","trim","dim","him","Kim","rim","vim","whim","brim"], ending: "ove" },
  { prompt: "blue", rhymes: ["clue","dew","due","flew","glue","grew","knew","new","true","who","you","zoo","brew","chew","crew","drew","few","stew","threw","through","view","anew","debut","pursue","renew","review","taboo","venue","askew","curfew","imbue","issue","statue","subdue","tissue","undo","undue","value","virtue","accrue","construe","continue","ensue","miscue","overdue","retinue","revenue","residue","avenue","barbecue","honeydew","overview"], ending: "ue" },
  { prompt: "fire", rhymes: ["hire","tire","wire","choir","liar","mire","prior","shire","sire","briar","flier","friar","flyer","buyer","crier","dryer","dryer","flier","pyre","spire","squire","umpire","aspire","attire","desire","entire","expire","inquire","inspire","require","retire","transpire"], ending: "ire" },
  { prompt: "rain", rhymes: ["brain","cane","crane","drain","gain","grain","lane","main","mane","pain","plain","plane","reign","strain","train","vain","wane","bane","chain","feign","fame","game","claim","explain","obtain","refrain","remain","retain","sustain","terrain","domain","insane","mundane","obtain","ordain","profane","regain","slain","Spain","stain","abstain","campaign","contain","detain","entertain","maintain","refrain","sustain"], ending: "ain" },
  { prompt: "song", rhymes: ["long","strong","wrong","along","belong","prolong","prong","tong","dong","gong","kong","throng","among","along","belong","lifelong","headlong","oblong","prolong","along","singsong","daylong","singalong","yearlong"], ending: "ong" },
  { prompt: "time", rhymes: ["chime","climb","crime","dime","grime","lime","mime","prime","rhyme","slime","sublime","thyme","clime","paradigm","bedtime","daytime","halftime","lifetime","nighttime","overtime","pastime","peacetime","summertime","wartime","anytime","dinnertime","mealtime","playtime","sometime","springtime"], ending: "ime" },
  { prompt: "dream", rhymes: ["beam","cream","gleam","seam","steam","stream","team","theme","scheme","scream","seem","teem","esteem","extreme","redeem","regime","supreme","upstream","downstream","daydream","mainstream","midstream","moonbeam","sunbeam","a-team","bloodstream","brainstorm","ice cream"], ending: "eam" },
  { prompt: "moon", rhymes: ["boon","cartoon","cocoon","dune","June","lagoon","maroon","noon","platoon","prune","raccoon","rune","spoon","swoon","tune","festoon","harpoon","bassoon","typhoon","baboon","balloon","buffoon","croon","dragoon","goon","hewn","immune","impugn","lampoon","monsoon","opine","platoon","pontoon","soon"], ending: "oon" },
  { prompt: "tree", rhymes: ["bee","fee","flee","free","glee","key","knee","lee","pea","sea","see","tea","three","agree","debris","decree","degree","employee","foresee","guarantee","harmony","hierarchy","jubilee","referee","trustee","acme","almighty","ceremony","galaxy","ivory","legacy","tendency"], ending: "ee" },
  { prompt: "heart", rhymes: ["art","cart","chart","dart","fart","mart","part","smart","start","tart","apart","depart","impart","restart","jumpstart","sweetheart","counterpart","fall apart","take part","take heart"], ending: "art" },
  { prompt: "light", rhymes: ["bite","bright","cite","delight","despite","excite","fight","finite","flight","fright","ignite","invite","kite","knight","might","moonlight","night","quite","recite","right","sight","slight","starlight","sunlight","tight","tonight","unite","upright","white","write"], ending: "ight" },
  { prompt: "gold", rhymes: ["bold","cold","fold","hold","mold","old","sold","told","behold","controlled","enrolled","household","manifold","scaffold","stronghold","threshold","blindfold","eightfold","foretold","uphold","withhold"], ending: "old" },
  { prompt: "mind", rhymes: ["behind","bind","blind","find","grind","kind","remind","unwind","wind","assigned","combined","confined","defined","designed","declined","inclined","resigned","aligned","entwined","refined","signed","intertwined","undefined","unkind","maligned","resigned"], ending: "ind" },
  { prompt: "face", rhymes: ["base","case","chase","grace","lace","mace","pace","place","race","space","trace","ace","brace","disgrace","displace","embrace","erase","fireplace","misplace","replace","showcase","staircase","suitcase","birthplace","commonplace","headspace","marketplace","pillowcase","workspace"], ending: "ace" },
  { prompt: "home", rhymes: ["comb","dome","foam","gnome","loam","poem","roam","chrome","gnome","syndrome","aerodrome","astrodome","chromosome","honeycomb","hippodrome","metronome","palindrome","velodrome"], ending: "ome" },
  { prompt: "road", rhymes: ["code","load","mode","node","ode","abode","bestowed","corrode","decode","erode","episode","explode","implode","overload","railroad","reload","unload","commode","download","overload","upload"], ending: "oad" },
  { prompt: "war", rhymes: ["bar","car","far","jar","mar","par","scar","star","tar","bizarre","caviar","cigar","guitar","radar","avatar","bazaar","crossbar","handlebar","jaguar","racecar","seminar","sidebar","stellar","superstar","toolbar","boxcar","crowbar","moldbar","sidecar","tramcar","railcar"], ending: "ar" },
];

function getDifficultySuffix(difficulty: "easy" | "medium" | "hard"): string {
  // Easy: 2 letters, medium: 3 letters, hard: 4+ letters
  // For simplicity we just return the ending used for matching
  return difficulty; // used conceptually in getMinRhymeLength
}

function getMinRhymeLength(difficulty: "easy" | "medium" | "hard"): number {
  if (difficulty === "easy") return 2;
  if (difficulty === "medium") return 3;
  return 4;
}

export interface RhymeTimeState {
  settings: RhymeTimeSettings;
  promptWord: string;
  ending: string;
  validRhymes: string[];
  foundRhymes: string[];
  inputText: string;
  timeLeft: number;
  lastError: string;
  phase: "playing" | "done";
}

export type RhymeTimeAction =
  | { type: "type"; text: string }
  | { type: "submit" }
  | { type: "tick" };

export function initialState(seed: number, settings: RhymeTimeSettings): RhymeTimeState {
  const rng = mulberry32(seed);
  const duration = parseInt(settings.duration, 10);
  const minLen = getMinRhymeLength(settings.difficulty);
  getDifficultySuffix(settings.difficulty); // used for type

  // Pick a group that has enough rhymes for the difficulty
  const filtered = RHYME_GROUPS.filter(g => g.rhymes.filter(r => r.length >= minLen).length >= 5);
  const group = filtered[Math.floor(rng() * filtered.length)]!;

  return {
    settings,
    promptWord: group.prompt,
    ending: group.ending,
    validRhymes: group.rhymes,
    foundRhymes: [],
    inputText: "",
    timeLeft: duration,
    lastError: "",
    phase: "playing",
  };
}

export function reducer(state: RhymeTimeState, action: RhymeTimeAction): RhymeTimeState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "type": {
      return { ...state, inputText: action.text.toLowerCase().replace(/[^a-z]/g, "") };
    }

    case "submit": {
      const word = state.inputText.trim();
      if (!word) return { ...state, lastError: "Type a word!" };
      if (word === state.promptWord) return { ...state, lastError: "That's the prompt word!", inputText: "" };
      if (state.foundRhymes.includes(word)) return { ...state, lastError: `"${word}" already found!`, inputText: "" };

      const minLen = getMinRhymeLength(state.settings.difficulty);
      if (word.length < minLen) {
        return { ...state, lastError: `Need at least ${minLen} letters for ${state.settings.difficulty} mode.`, inputText: "" };
      }

      const isRhyme = state.validRhymes.includes(word);
      if (!isRhyme) {
        return { ...state, lastError: `"${word}" doesn't rhyme with "${state.promptWord}".`, inputText: "" };
      }

      return {
        ...state,
        foundRhymes: [...state.foundRhymes, word],
        inputText: "",
        lastError: "",
      };
    }

    case "tick": {
      const newTime = state.timeLeft - 1;
      if (newTime <= 0) {
        return { ...state, timeLeft: 0, phase: "done" };
      }
      return { ...state, timeLeft: newTime };
    }

    default:
      return state;
  }
}

export function isTerminal(state: RhymeTimeState): { score: number } | null {
  if (state.phase === "done") return { score: state.foundRhymes.length * 10 };
  return null;
}
