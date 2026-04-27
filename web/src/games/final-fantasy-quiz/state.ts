import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface FinalFantasySettings { questions: "10" | "20" | "30"; }
export interface FinalFantasyState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type FinalFantasyAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "FF developer?", choices: ["Square (Square Enix)","Capcom","Konami","Nintendo"], correct: 0 },
  { question: "First FF game year?", choices: ["1987","1985","1990","1992"], correct: 0 },
  { question: "FF7 protagonist?", choices: ["Cloud Strife","Tidus","Squall","Lightning"], correct: 0 },
  { question: "FF7 antagonist?", choices: ["Sephiroth","Kefka","Kuja","Seymour"], correct: 0 },
  { question: "FF6 protagonist?", choices: ["Terra Branford","Cloud","Cecil","Tidus"], correct: 0 },
  { question: "FF10 protagonist?", choices: ["Tidus","Yuna","Cloud","Squall"], correct: 0 },
  { question: "FF10 setting?", choices: ["Spira","Gaia","Ivalice","Eorzea"], correct: 0 },
  { question: "FF14 setting?", choices: ["Eorzea","Spira","Gaia","Ivalice"], correct: 0 },
  { question: "FF14 is a?", choices: ["MMORPG","Single-player","Fighting","Racing"], correct: 0 },
  { question: "Chocobos are?", choices: ["Yellow birds","Cats","Dogs","Dragons"], correct: 0 },
  { question: "Moogles are?", choices: ["Cute creatures w/ pompom","Robots","Dragons","Aliens"], correct: 0 },
  { question: "Cid appears in?", choices: ["Most/all games","Just FF1","Just FF7","None"], correct: 0 },
  { question: "FF8 protagonist?", choices: ["Squall Leonhart","Cloud","Tidus","Lightning"], correct: 0 },
  { question: "FF9 protagonist?", choices: ["Zidane Tribal","Cloud","Tidus","Squall"], correct: 0 },
  { question: "Sephiroth's weapon?", choices: ["Masamune","Buster Sword","Gunblade","Brotherhood"], correct: 0 },
  { question: "Cloud's weapon?", choices: ["Buster Sword","Masamune","Gunblade","Excalibur"], correct: 0 },
  { question: "FF7 Remake launched on?", choices: ["PS4","PS3","Switch","PC only"], correct: 0 },
  { question: "Aerith's flower?", choices: ["Yellow flowers (Mid Lily)","Roses","Tulips","Lilies"], correct: 0 },
  { question: "FF15 protagonist?", choices: ["Noctis Lucis Caelum","Cloud","Tidus","Squall"], correct: 0 },
  { question: "FF15 vehicle?", choices: ["Regalia","Buggy","Truck","Train"], correct: 0 },
  { question: "FF13 protagonist?", choices: ["Lightning","Cloud","Tidus","Squall"], correct: 0 },
  { question: "FF12 setting?", choices: ["Ivalice","Spira","Eorzea","Gaia"], correct: 0 },
  { question: "FF1 jobs include?", choices: ["Warrior, Thief, etc","Just Warrior","No jobs","Mage only"], correct: 0 },
  { question: "FF Tactics game?", choices: ["Yes (PSX)","No","Maybe","GBA only"], correct: 0 },
  { question: "Kingdom Hearts crosses with?", choices: ["Disney + FF","Just Disney","Just FF","Pokemon"], correct: 0 },
  { question: "Music composer for many FFs?", choices: ["Nobuo Uematsu","Koji Kondo","Yasunori Mitsuda","Yoko Shimomura"], correct: 0 },
  { question: "Crystal theme appears in?", choices: ["Most FFs","FF7 only","FF1 only","None"], correct: 0 },
  { question: "Black Mage outfit?", choices: ["Pointy hat, dark robes","Red robes","Armor","Casual"], correct: 0 },
  { question: "FF7 Remake Part 2 title?", choices: ["Rebirth","Reunion","Revival","Rebellion"], correct: 0 },
  { question: "FFX summons called?", choices: ["Aeons","Espers","Eidolons","GFs"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: FinalFantasySettings): FinalFantasyState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: FinalFantasyState, action: FinalFantasyAction): FinalFantasyState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: FinalFantasyState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
