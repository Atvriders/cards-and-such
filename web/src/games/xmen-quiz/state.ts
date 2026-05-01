import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface XmenQuizSettings { questions: "10" | "20"; }
export interface XmenQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type XmenQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The X-Men's leader and founder?", choices: ["Professor Charles Xavier", "Magneto", "Cyclops", "Wolverine"], correct: 0 },
  { question: "Wolverine's real name?", choices: ["Logan / James Howlett", "Scott Summers", "Hank McCoy", "Erik Lehnsherr"], correct: 0 },
  { question: "Cyclops's real name?", choices: ["Scott Summers", "Hank McCoy", "Bobby Drake", "Warren Worthington III"], correct: 0 },
  { question: "Beast's real name?", choices: ["Hank McCoy", "Scott Summers", "Bobby Drake", "Warren Worthington"], correct: 0 },
  { question: "Iceman's real name?", choices: ["Bobby Drake", "Hank McCoy", "Warren Worthington", "Scott Summers"], correct: 0 },
  { question: "Angel's real name?", choices: ["Warren Worthington III", "Hank McCoy", "Bobby Drake", "Kurt Wagner"], correct: 0 },
  { question: "Storm's real name?", choices: ["Ororo Munroe", "Jean Grey", "Anna Marie", "Kitty Pryde"], correct: 0 },
  { question: "Magneto's real name?", choices: ["Erik Lehnsherr / Max Eisenhardt", "Charles Xavier", "Victor Creed", "Apocalypse"], correct: 0 },
  { question: "Wolverine's metal-laced bones come from?", choices: ["Adamantium (Weapon X)", "Vibranium", "Mithril", "Carbonadium"], correct: 0 },
  { question: "Jean Grey's psychic alter ego?", choices: ["Phoenix", "Marvel Girl", "Black Queen", "Goblin Queen"], correct: 0 },
  { question: "Rogue's mutant ability?", choices: ["Absorbs powers/memories on touch", "Phasing", "Flight only", "Telekinesis"], correct: 0 },
  { question: "Nightcrawler's mutant ability?", choices: ["Teleportation", "Flight", "Healing", "Energy beams"], correct: 0 },
  { question: "Gambit's signature attack?", choices: ["Charging cards with kinetic energy", "Lightning hands", "Sonic blasts", "Diamond skin"], correct: 0 },
  { question: "Kitty Pryde's mutant ability?", choices: ["Phasing through matter", "Invisibility", "Reading minds", "Time travel"], correct: 0 },
  { question: "Colossus's ability?", choices: ["Organic steel transformation", "Super speed", "Plant control", "Telepathy"], correct: 0 },
  { question: "Mystique's ability?", choices: ["Shapeshifting", "Telepathy", "Magnetism", "Speedster"], correct: 0 },
  { question: "Cerebro is used to?", choices: ["Detect mutants worldwide", "Train mutants", "Suppress powers", "Travel time"], correct: 0 },
  { question: "Sentinels are?", choices: ["Giant mutant-hunting robots", "Hero team", "Aliens", "Stealth ships"], correct: 0 },
  { question: "The X-Men's school is in?", choices: ["Westchester, New York", "Manhattan", "Los Angeles", "Genosha"], correct: 0 },
  { question: "Apocalypse's real name?", choices: ["En Sabah Nur", "Erik Lehnsherr", "Nathaniel Essex", "Kang"], correct: 0 },
  { question: "Mr. Sinister's real name?", choices: ["Nathaniel Essex", "Bolivar Trask", "En Sabah Nur", "Stryker"], correct: 0 },
  { question: "Bolivar Trask is famous for creating?", choices: ["Sentinels", "Cerebro", "Adamantium", "The Danger Room"], correct: 0 },
  { question: "Deadpool's real name?", choices: ["Wade Wilson", "Slade Wilson", "Nathan Summers", "Logan"], correct: 0 },
  { question: "Cable is the son of?", choices: ["Cyclops and Madelyne Pryor", "Wolverine and Jean", "Magneto and Mystique", "Xavier and Moira"], correct: 0 },
  { question: "Quicksilver's father (revealed in Marvel)?", choices: ["Magneto (originally)", "Professor X", "Apocalypse", "Mr. Sinister"], correct: 0 },
  { question: "Scarlet Witch's brother?", choices: ["Quicksilver", "Vision", "Hawkeye", "Professor X"], correct: 0 },
  { question: "Emma Frost is also called the?", choices: ["White Queen", "Black Queen", "Red Queen", "Goblin Queen"], correct: 0 },
  { question: "X-Men created by Stan Lee and?", choices: ["Jack Kirby", "Steve Ditko", "Bill Everett", "Don Heck"], correct: 0 },
  { question: "X-Men first appeared in?", choices: ["X-Men #1 (1963)", "Amazing Adventures", "Tales of Suspense", "Strange Tales"], correct: 0 },
  { question: "Genosha is a fictional?", choices: ["Mutant-related island nation", "U.S. state", "Marvel hospital", "Spy agency"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: XmenQuizSettings): XmenQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(qq=>{const idx=qq.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===qq.correct) as 0|1|2|3;return{...qq,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: XmenQuizState, action: XmenQuizAction): XmenQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const qq=state.questions[state.currentIndex]!;const ok=state.selected===qq.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: XmenQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
