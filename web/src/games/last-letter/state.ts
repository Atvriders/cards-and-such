import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Last Letter: chain words where each word starts with the last letter of the previous word
export interface LastLetterState {
  settings: { duration: "60" | "90" | "120" };
  starterWord: string;
  chain: string[];
  input: string;
  timeLeft: number;
  score: number;
  lastError: string;
  phase: "playing" | "done";
}

export type LastLetterAction =
  | { type: "type"; text: string }
  | { type: "submit" }
  | { type: "tick" };

const STARTER_WORDS = [
  "apple", "ocean", "tiger", "flame", "dream", "cloud", "earth", "storm",
  "piano", "river", "stone", "magic", "brave", "night", "spark", "tower",
  "light", "crown", "bloom", "ghost", "chest", "plant", "wheel", "grape",
  "brush", "sword", "chair", "table", "dance", "voice",
];

// Large validation dictionary
const VALID_WORDS = new Set([
  "apple","able","ago","arm","ace","ant","arc","art","ask","ate","ail","aim","air","ale","all","and","any","ape",
  "back","ball","bank","bare","bark","barn","base","bath","bear","beat","beef","beer","belt","best","bite","blow","blue","boat","bold","bomb","bone","book","boot","born","both","bowl","bull","burn","bush","busy","buzz",
  "cafe","cage","cake","call","calm","camp","card","care","cart","case","cast","cave","cell","chat","chin","chip","city","clam","clap","clay","clip","club","clue","coal","coat","code","coin","cold","come","cook","cool","cope","cord","core","corn","cost","coup","cove","crew","crop","crow","cube","cure","curl",
  "dale","dame","dare","dark","dart","dash","dawn","dead","deaf","deal","dear","deck","deed","deep","deer","dell","dent","desk","dial","diet","dirt","dish","disk","dive","dock","does","dome","done","door","dove","down","draw","drew","drip","drop","drug","drum","duck","duke","dull","dumb","dump","dune","dusk","dust",
  "each","earl","earn","ease","east","edge","else","emit","envy","epic","even","ever","evil","exam",
  "face","fact","fail","fair","fake","fall","fame","farm","fast","fate","fawn","fear","feat","feed","feel","feet","fell","felt","fern","film","find","fine","fire","fish","fist","flag","flat","flew","flip","flow","foam","fold","folk","fond","font","food","fool","foot","fork","form","fort","foul","fowl","free","from","fuel","full","fume","fuse",
  "gale","game","gang","gave","gear","gaze","germ","gift","girl","give","glad","glow","goad","goal","goat","goes","gold","golf","gone","good","gore","gown","grab","gram","gray","grew","grin","grip","grit","grow","gulf","gust","gust",
  "hack","hail","hall","halt","hand","hang","hard","hare","harm","harp","hawk","haze","head","heal","heap","hear","heat","heel","help","herb","herd","hero","hide","high","hill","hint","hold","hole","home","hood","hook","hope","horn","hose","host","hour","huge","hull","hunt","hurt","hush",
  "icon","idea","idle","inch","into","iron","isle",
  "jade","jail","jerk","jest","join","joke","jolt","jump","junk","just",
  "keen","keep","kill","kind","king","knit","knob","knot","know",
  "lace","lack","lake","lamb","lamp","land","lane","lash","last","late","laud","lawn","lead","leaf","lean","leap","left","lend","lens","less","lick","life","lift","like","lime","lore","lose","loss","lost","loud","love","luck","lump","lung",
  "mace","made","maid","make","mane","mare","mark","mask","mass","mast","maze","meet","meld","mend","menu","milk","mill","mind","mine","mint","miss","moan","moat","mock","mode","monk","mood","moon","moor","more","moss","most","mote","much","muck","muddy","mule","murk","muse","musk",
  "nail","name","neat","neck","need","nest","news","next","nice","nine","node","nook","noon","norm","nose","note","noun",
  "oath","obey","ocean","omen","once","only","open","oral","oven","owed","oxen",
  "pace","pack","page","paid","pail","pain","pale","palm","pane","park","pass","past","path","peak","pear","peel","peer","perk","pest","pile","pill","pine","pipe","plan","plea","plod","plop","plot","plow","plum","poem","poll","pond","pool","poor","pope","pore","port","pose","pour","prey","prop","pull","pump","pure","push",
  "race","rack","rage","raid","rail","rain","rake","ramp","rand","rang","rank","rant","rasp","rave","read","real","reed","reef","reel","rely","rend","rent","rest","rice","rich","ride","rift","ring","rise","risk","road","roam","roar","robe","rock","rode","role","roll","romp","roof","room","root","rope","rose","rote","rout","rove","rude","ruin","rule","rump","ruse","rush","rust",
  "sack","safe","sage","sail","salt","same","sand","sang","sank","sash","save","seal","seam","sear","seat","self","sell","shed","shin","ship","shoe","shop","shot","show","shut","side","sigh","silk","sing","sink","size","skip","slab","slag","slap","slay","slim","slip","slot","slow","slum","smug","snag","snap","snob","snow","soak","soap","soar","sock","soft","soil","sole","some","song","soon","soot","soul","soup","sour","span","spar","sped","spin","spot","spur","stab","stag","stay","stem","step","stew","stir","stop","stub","such","sulk","sure","surf","swam","swan","swap","swat","sway","swum",
  "tack","tale","talk","tall","tame","tang","tank","tape","tare","task","tear","teem","tent","term","test","than","thaw","them","then","thin","this","thorn","tick","tide","tier","till","time","tips","tire","toad","toil","told","toll","tomb","tore","torn","toss","tour","town","trim","trio","trip","true","tuck","tuft","tune","turf","turn","tusk","tutu","twin","twig",
  "ugly","undo","unit","upon","urge","used","user",
  "vale","vane","vase","vast","veil","vein","vent","verb","very","vest","vial","view","vine","void","volt","vomit","vow","vane",
  "wade","wage","wail","wake","walk","wall","wand","wane","want","ward","ware","warm","warn","warp","wars","wart","wary","wash","wasp","wave","weak","weld","went","were","west","whim","whip","whit","wick","wide","wild","wile","will","wilt","wind","wine","wing","wink","wise","wish","wisp","woke","womb","wood","wool","worm","worn","wove","wrap","wren","writ",
  "yawn","year","yell","yoga","yoke","yore","zero","zest","zinc","zone","zoom",
  "tiger","flame","dream","cloud","earth","storm","piano","river","stone","magic","brave","night","spark","tower","light","crown","bloom","ghost","chest","plant","wheel","grape","brush","sword","chair","table","dance","voice",
  "ocean","angle","blaze","canal","depot","eager","fatal","grace","horse","image","kneel","labor","manor","noble","orbit","party","quest","reach","skill","trade","ultra","value","wagon","xenon","yearn",
  "amber","bench","brisk","cabin","delta","ember","flute","grove","haven","igloo","jacket","lance","maple","nerve","onion","pride","quill","realm","scent","slope","tapir","unify","vigor","weave","xylem","yacht","zebra",
  "abide","adult","agent","agree","ahead","alarm","album","alert","algae","align","aloft","alone","along","aloud","altar","angel","anger","angle","ankle","annex","antic","anvil","apart","apron","arena","argue","arise","array","arrow","asset","atlas","audio","audit","avoid","award","awoke",
  "badly","bagel","basin","baste","batch","baton","beach","beast","began","begin","being","below","bench","berry","beset","bison","black","blade","blame","blank","blast","bleed","blend","bless","blink","block","blood","bloom","boast","bound","brave","break","breed","bribe","brick","bride","brief","brine","bring","brink","brisk","broad","broke","brook","brown","bruise","brust","build","bulge","burst",
]);

export function initialState(seed: number, settings: { duration: "60" | "90" | "120" }): LastLetterState {
  const rng = mulberry32(seed);
  const starter = STARTER_WORDS[Math.floor(rng() * STARTER_WORDS.length)]!;
  return {
    settings,
    starterWord: starter,
    chain: [starter],
    input: "",
    timeLeft: parseInt(settings.duration, 10),
    score: 0,
    lastError: "",
    phase: "playing",
  };
}

export function reducer(state: LastLetterState, action: LastLetterAction): LastLetterState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "type": {
      return { ...state, input: action.text.toLowerCase().replace(/[^a-z]/g, "") };
    }
    case "submit": {
      const word = state.input.trim();
      if (!word) return { ...state, lastError: "Type a word first." };
      if (word.length < 3) return { ...state, lastError: "At least 3 letters.", input: "" };
      const lastWord = state.chain[state.chain.length - 1]!;
      const needed = lastWord[lastWord.length - 1]!;
      if (word[0] !== needed) return { ...state, lastError: `Word must start with '${needed.toUpperCase()}'.`, input: "" };
      if (state.chain.includes(word)) return { ...state, lastError: `"${word}" already used!`, input: "" };
      if (!VALID_WORDS.has(word)) return { ...state, lastError: `"${word}" not recognized.`, input: "" };
      return { ...state, chain: [...state.chain, word], input: "", lastError: "", score: state.score + word.length };
    }
    case "tick": {
      const newTime = state.timeLeft - 1;
      if (newTime <= 0) return { ...state, timeLeft: 0, phase: "done" };
      return { ...state, timeLeft: newTime };
    }
    default:
      return state;
  }
}

export function isTerminal(state: LastLetterState): { score: number } | null {
  if (state.phase === "done") return { score: state.score };
  return null;
}
