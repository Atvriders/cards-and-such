import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface XmenQuizSettings { questions: "10" | "20"; }
export interface XmenQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type XmenQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The X-Men founder?", choices: ["Professor Charles Xavier", "Magneto", "Wolverine", "Cyclops"], correct: 0 },
  { question: "Xavier's gift?", choices: ["Telepathy", "Telekinesis", "Healing", "Magnetism"], correct: 0 },
  { question: "Magneto controls?", choices: ["Magnetism", "Fire", "Time", "Minds"], correct: 0 },
  { question: "Wolverine's real name?", choices: ["James Howlett", "Logan Smith", "Victor Creed", "Scott Summers"], correct: 0 },
  { question: "Wolverine's claws?", choices: ["Bone (with adamantium)", "Pure adamantium", "Vibranium", "Energy"], correct: 0 },
  { question: "Cyclops's power?", choices: ["Optic blasts", "Flight", "Strength", "Wind"], correct: 0 },
  { question: "Storm's real name?", choices: ["Ororo Munroe", "Jean Grey", "Anna Marie", "Kitty Pryde"], correct: 0 },
  { question: "Storm controls?", choices: ["Weather", "Time", "Plants", "Earth"], correct: 0 },
  { question: "Jean Grey hosts?", choices: ["Phoenix Force", "Mind Stone", "Soul Stone", "Galactus"], correct: 0 },
  { question: "Nightcrawler's main power?", choices: ["Teleportation", "Flight", "Strength", "Telepathy"], correct: 0 },
  { question: "Colossus turns into?", choices: ["Organic steel", "Diamond", "Ice", "Rock"], correct: 0 },
  { question: "Iceman's real name?", choices: ["Bobby Drake", "Hank McCoy", "Warren Worthington", "Scott Summers"], correct: 0 },
  { question: "Beast's real name?", choices: ["Hank McCoy", "Bobby Drake", "Charles Xavier", "Warren Worthington"], correct: 0 },
  { question: "Angel/Archangel?", choices: ["Warren Worthington III", "Sam Guthrie", "Roberto da Costa", "Hank McCoy"], correct: 0 },
  { question: "Mystique can?", choices: ["Shapeshift", "Fly", "Phase", "Heal"], correct: 0 },
  { question: "Sabretooth's grudge with?", choices: ["Wolverine", "Cyclops", "Storm", "Magneto"], correct: 0 },
  { question: "Rogue's power?", choices: ["Absorbs powers", "Flight only", "Telepathy", "Strength only"], correct: 0 },
  { question: "Gambit charges what kinetically?", choices: ["Cards", "Knives", "Eyes", "Fists"], correct: 0 },
  { question: "School location?", choices: ["Westchester, NY", "Brooklyn", "Genosha", "Krakoa"], correct: 0 },
  { question: "Sentinels are?", choices: ["Mutant-hunting robots", "Aliens", "Mutates", "Asgardians"], correct: 0 },
  { question: "Days of Future Past involves?", choices: ["Time travel", "Cosmic war", "Inhumans", "Skrulls"], correct: 0 },
  { question: "Phoenix Saga ends with?", choices: ["Jean's sacrifice", "Cyclops victory", "Magneto wins", "Galactus arrives"], correct: 0 },
  { question: "Krakoa is a?", choices: ["Living island/nation", "City", "Ship", "Planet"], correct: 0 },
  { question: "Marauders led by?", choices: ["Sinister", "Magneto", "Apocalypse", "Sebastian Shaw"], correct: 0 },
  { question: "Apocalypse's catchphrase?", choices: ["Survival of the fittest", "All or none", "Mutant pride", "Chaos reigns"], correct: 0 },
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
