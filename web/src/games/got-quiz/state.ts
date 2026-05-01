import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface GoTSettings { questions: "10" | "20" | "30"; }
export interface GoTState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type GoTAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What books is Game of Thrones based on?", choices: ["A Song of Ice and Fire by GRR Martin","Just Game of Thrones","Both","Lord of the Rings"], correct: 0 },
  { question: "Who wrote A Song of Ice and Fire?", choices: ["George R.R. Martin","J.K. Rowling","Brandon Sanderson","Robert Jordan"], correct: 0 },
  { question: "What are the seven kingdoms?", choices: ["Westeros divisions","All in Westeros","Both","Just kingdoms"], correct: 2 },
  { question: "What is the Iron Throne?", choices: ["Made of melted swords","Symbol of rule","Both","Made of obsidian"], correct: 2 },
  { question: "What's Daenerys's House?", choices: ["Targaryen","Stark","Lannister","Baratheon"], correct: 0 },
  { question: "What's Jon Snow's House (raised as)?", choices: ["Stark","Targaryen","Both lineages","Just Stark"], correct: 2 },
  { question: "What House is in Casterly Rock?", choices: ["Lannister","Stark","Targaryen","Baratheon"], correct: 0 },
  { question: "What House sigil is a wolf?", choices: ["Stark","Lannister","Tully","Tyrell"], correct: 0 },
  { question: "What House sigil is a lion?", choices: ["Lannister","Stark","Greyjoy","Martell"], correct: 0 },
  { question: "What House sigil is a dragon?", choices: ["Targaryen","Stark","Baratheon","Tyrell"], correct: 0 },
  { question: "What's the wall in the North made of?", choices: ["Ice","Stone","Wood","Iron"], correct: 0 },
  { question: "What guards the Wall?", choices: ["Night's Watch","Wildlings","White Walkers","All forces"], correct: 0 },
  { question: "What are the White Walkers?", choices: ["Ice creatures","Ghosts","Living dead","Just Walkers"], correct: 0 },
  { question: "What's the leader of the Night King's army?", choices: ["Night King","Three-eyed Raven","Bran","Just King"], correct: 0 },
  { question: "Who finally killed the Night King?", choices: ["Arya Stark","Jon Snow","Daenerys","Brienne"], correct: 0 },
  { question: "What's Daenerys's first dragon name?", choices: ["Drogon","Rhaegal","Viserion","All her dragons"], correct: 0 },
  { question: "What's the dragon Daenerys lost to the Night King?", choices: ["Viserion","Rhaegal","Drogon","All eventually"], correct: 0 },
  { question: "What's Cersei's son who became king first?", choices: ["Joffrey","Tommen","Both ruled","Just Joffrey"], correct: 2 },
  { question: "Who poisoned Joffrey at his wedding?", choices: ["Olenna and Littlefinger","Tyrion","Margaery","Sansa"], correct: 0 },
  { question: "What's the Red Wedding?", choices: ["Stark family massacre","Royal wedding","Both","Just massacre"], correct: 0 },
  { question: "Who orchestrated the Red Wedding?", choices: ["Walder Frey, Tywin, Roose Bolton","Just Frey","Just Tywin","Both Frey and Bolton"], correct: 0 },
  { question: "Who plays Jon Snow?", choices: ["Kit Harington","Iain Glen","Liam Cunningham","Iwan Rheon"], correct: 0 },
  { question: "Who plays Daenerys?", choices: ["Emilia Clarke","Lena Headey","Sophie Turner","Maisie Williams"], correct: 0 },
  { question: "Who plays Tyrion?", choices: ["Peter Dinklage","Sean Bean","Charles Dance","Iwan Rheon"], correct: 0 },
  { question: "Who plays Cersei?", choices: ["Lena Headey","Emilia Clarke","Carice van Houten","Sophie Turner"], correct: 0 },
  { question: "What's Arya's sword called?", choices: ["Needle","Longclaw","Oathkeeper","Heartsbane"], correct: 0 },
  { question: "What's Jon Snow's sword?", choices: ["Longclaw","Needle","Ice","Oathkeeper"], correct: 0 },
  { question: "What word is GOT's iconic family motto for Stark?", choices: ["Winter is Coming","Hear me roar","Fire and Blood","Ours is the Fury"], correct: 0 },
  { question: "What's the Lannister motto?", choices: ["Hear Me Roar (official) / A Lannister Always Pays His Debts (saying)","Just Hear Me Roar","Both","Just debts saying"], correct: 2 },
  { question: "What's the Targaryen words?", choices: ["Fire and Blood","Winter is Coming","Hear Me Roar","Ours is the Fury"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: GoTSettings): GoTState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: GoTState, action: GoTAction): GoTState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: GoTState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
