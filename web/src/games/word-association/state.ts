import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface WordAssocSettings {
  duration: "60" | "120";
}

// A curated list of starter words and a simple dictionary for validation
const STARTER_WORDS = [
  "ocean", "fire", "dream", "music", "cloud", "book", "tree", "light",
  "city", "river", "storm", "flower", "time", "star", "door", "bridge",
  "snow", "night", "sun", "moon", "wind", "earth", "gold", "shadow",
  "rain", "glass", "heart", "stone", "mountain", "forest",
];

// Large word list for validation (common English words)
export const VALID_WORDS = new Set([
  "apple","able","about","above","across","act","add","afraid","after","again","age","ago",
  "ahead","aim","air","all","almost","alone","along","already","also","although","always",
  "among","and","animal","another","any","apart","appear","arm","army","around","art",
  "ask","away","baby","back","bad","ball","base","bear","beat","become","before","begin",
  "behind","believe","belong","best","better","between","big","bird","black","blood","blue",
  "boat","body","book","born","both","break","bring","brother","build","burn","but","buy",
  "call","calm","came","camp","care","carry","catch","cause","center","chance","change",
  "child","choose","city","clean","clear","close","cold","color","come","complete",
  "control","copy","could","count","cover","create","cross","cut","dark","dead","deep",
  "door","down","draw","dream","drink","drive","drop","dry","each","early","earth","east",
  "easy","edge","else","end","energy","enough","enter","even","every","exist","eye",
  "face","fact","fair","fall","far","fast","father","feel","feet","few","field","fight",
  "fill","find","fine","fire","first","fish","fit","floor","flow","fly","food","force",
  "forest","form","free","friend","from","front","full","game","give","glass","gold",
  "good","great","green","ground","group","grow","hand","happy","hard","have","head",
  "hear","heart","help","here","high","hold","hole","home","hope","horse","hour","house",
  "huge","human","hunt","idea","into","iron","just","keep","kind","know","lake","land",
  "large","last","lead","leaf","learn","left","less","life","lift","light","like","line",
  "live","long","look","lose","love","make","many","mark","mean","meet","mind","miss",
  "moon","more","most","move","much","music","must","name","near","need","news","next",
  "night","north","note","nothing","now","ocean","open","order","other","over","own",
  "part","pass","path","peace","pick","plan","play","point","power","pull","push","rain",
  "read","real","rest","right","rise","road","rock","role","room","root","rule","safe",
  "same","save","seen","self","send","sense","serve","shape","share","ship","show","side",
  "sign","since","size","skin","slow","small","snow","some","soon","sort","soul","south",
  "space","speak","speed","stand","star","start","stay","step","still","stop","store",
  "story","stream","street","strong","study","such","summer","super","sure","swim","take",
  "talk","tall","team","that","then","there","thing","think","time","tiny","together",
  "town","tree","true","turn","type","under","until","upon","used","very","view","voice",
  "wait","walk","wall","want","warm","watch","water","wave","west","white","wide","will",
  "wind","wish","with","word","work","world","worth","would","write","yard","year","your",
  "zone","above","across","again","against","alone","along","among","around","away",
  "back","before","behind","below","between","beyond","broken","burn","catch","check",
  "child","choice","clean","climb","cold","cool","cover","cry","dance","deep","down",
  "draw","drop","earn","east","edge","else","even","every","fall","fill","final","fire",
  "fit","fly","follow","found","fresh","front","full","gift","girl","glad","glass","grace",
  "guide","half","hard","harm","heal","help","hide","hill","hold","hope","hurt","keep",
  "land","layer","lead","learn","leave","long","look","lost","made","main","mind","miss",
  "mix","near","note","open","pain","path","place","plan","plant","point","poor","port",
  "pure","push","quest","quick","quiet","read","real","recall","risk","rock","role","root",
  "rule","rush","safe","salt","sand","seed","send","shape","sharp","short","slow","soft",
  "soil","solid","soul","south","spring","still","stone","stop","store","storm","straight",
  "success","sun","sweet","swim","test","thick","thin","thought","tight","tip","today",
  "top","touch","toward","trail","trust","turn","twist","type","under","unit","upon",
  "valid","value","view","visit","void","vote","wage","wake","wall","wave","wealth","wide",
  "wild","winter","wise","wish","wonder","yard","young","zone","bridge","mountain","river",
  "shadow","shadow","flower","power","tower","shower","cover","hover","over","drive",
  "alive","arrive","strive","thrive","hive","dive","give","live","forgive","positive",
  "native","active","passive","massive","massive","classic","basic","magic","logic","sonic",
  "topic","cosmic","atomic","comic","toxic","epic","basic","civic","fabric","critic","lyric",
  "music","public","static","dynamic","organic","chronic","clinic","panic","traffic",
  "attack","black","crack","stack","track","back","hack","jack","lack","pack","rack","sack",
  "bright","flight","night","right","sight","fight","tight","light","might","knight",
  "cloud","loud","crowd","proud","aloud","shroud","ground","found","round","sound","bound",
  "bread","thread","spread","ahead","dead","read","lead","head","bead","feed","freed",
  "breed","creed","speed","steed","tree","free","three","agree","degree","fleece","geese",
  "ease","please","tease","freeze","breeze","sneeze","cheese","these","those","close",
  "nose","rose","chose","pose","prose","hose","alone","bone","cone","done","gone","lone",
  "phone","stone","tone","zone","drone","shone","throne","clone","blown","grown","known",
  "shown","town","down","gown","own","shown","brown","crown","frown","grown","noun","around",
  "become","welcome","outcome","problem","kingdom","random","bottom","custom","system",
  "stream","dream","cream","team","beam","seam","gleam","steam","realm","helm","film",
  "calm","palm","psalm","balm","arm","farm","harm","warm","charm","alarm","bark","dark",
  "mark","park","spark","stark","lark","shark","park","remark","landmark","framework",
  "bright","delight","flight","knight","light","might","night","right","sight","slight",
  "tight","tonight","upright","forthright","outright","oversight","twilight","moonlight",
  "sunlight","daylight","firelight","starlight","highlight","insight","despite","excite",
  "quite","write","bite","cite","kite","mite","site","white","invite","ignite","polite",
  "blue","clue","due","glue","true","flew","grew","knew","threw","new","dew","few","crew",
  "brew","chew","stew","view","review","pursue","value","venue","issue","tissue","rescue",
  "argue","queue","statue","virtue","continue","revenue","unique","antique","technique",
  "blank","bank","rank","tank","thank","frank","drank","sank","plank","clank","crank",
  "prank","shrank","yank","spank","swank","drink","link","pink","sink","think","wink",
  "bring","ring","sing","king","wing","thing","spring","string","swing","cling","fling",
]);

export interface WordAssocState {
  settings: WordAssocSettings;
  starterWord: string;
  chain: string[];
  inputText: string;
  timeLeft: number;
  lastError: string;
  phase: "playing" | "done";
}

export type WordAssocAction =
  | { type: "type"; text: string }
  | { type: "submit" }
  | { type: "tick" };

export function initialState(seed: number, settings: WordAssocSettings): WordAssocState {
  const rng = mulberry32(seed);
  const starterWord = STARTER_WORDS[Math.floor(rng() * STARTER_WORDS.length)]!;
  const duration = parseInt(settings.duration, 10);

  return {
    settings,
    starterWord,
    chain: [starterWord],
    inputText: "",
    timeLeft: duration,
    lastError: "",
    phase: "playing",
  };
}

export function reducer(state: WordAssocState, action: WordAssocAction): WordAssocState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "type": {
      return { ...state, inputText: action.text.toLowerCase().replace(/[^a-z]/g, "") };
    }

    case "submit": {
      const word = state.inputText.trim();
      if (!word) return { ...state, lastError: "Type a word first." };

      if (state.chain.includes(word)) {
        return { ...state, lastError: `"${word}" already used!`, inputText: "" };
      }

      if (word.length < 2) {
        return { ...state, lastError: "Word must be at least 2 letters.", inputText: "" };
      }

      if (!VALID_WORDS.has(word)) {
        return { ...state, lastError: `"${word}" not recognized. Try another word.`, inputText: "" };
      }

      return {
        ...state,
        chain: [...state.chain, word],
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

export function isTerminal(state: WordAssocState): { score: number } | null {
  if (state.phase === "done") {
    // Score = chain length minus 1 (starter doesn't count)
    return { score: state.chain.length - 1 };
  }
  return null;
}
