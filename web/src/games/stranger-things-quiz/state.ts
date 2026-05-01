import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface StrangerThingsSettings { questions: "10" | "20" | "30"; }
export interface StrangerThingsState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type StrangerThingsAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What town is Stranger Things set in?", choices: ["Hawkins, Indiana","Hawkins, Ohio","Hartford","Hawkins, Illinois"], correct: 0 },
  { question: "What state is Hawkins in?", choices: ["Indiana","Ohio","Illinois","Iowa"], correct: 0 },
  { question: "What decade is Stranger Things set in?", choices: ["1980s","1970s","1990s","Mixed"], correct: 0 },
  { question: "Who created Stranger Things?", choices: ["The Duffer Brothers","Dan and Eugene Levy","JJ Abrams","Lin-Manuel"], correct: 0 },
  { question: "What's the alternate dimension called?", choices: ["The Upside Down","The Underworld","The Other Place","The Inverse"], correct: 0 },
  { question: "What's the secret lab in Hawkins called?", choices: ["Hawkins National Laboratory","Hawkins Lab","Both","Star Lab"], correct: 2 },
  { question: "What's Eleven's number?", choices: ["011 / Eleven","12","13","10"], correct: 0 },
  { question: "Who plays Eleven?", choices: ["Millie Bobby Brown","Sadie Sink","Natalia Dyer","Maya Hawke"], correct: 0 },
  { question: "Who's Mike's group of friends?", choices: ["Will, Dustin, Lucas","All friends","Both","Just group"], correct: 2 },
  { question: "Who plays Mike Wheeler?", choices: ["Finn Wolfhard","Noah Schnapp","Gaten Matarazzo","Caleb McLaughlin"], correct: 0 },
  { question: "Who plays Will Byers?", choices: ["Noah Schnapp","Finn Wolfhard","Gaten Matarazzo","Caleb McLaughlin"], correct: 0 },
  { question: "Who plays Dustin?", choices: ["Gaten Matarazzo","Caleb McLaughlin","Finn Wolfhard","Noah Schnapp"], correct: 0 },
  { question: "Who plays Lucas?", choices: ["Caleb McLaughlin","Gaten Matarazzo","Finn Wolfhard","Noah Schnapp"], correct: 0 },
  { question: "Who plays Joyce Byers?", choices: ["Winona Ryder","Cara Buono","Carmen Cusack","Catherine Curtin"], correct: 0 },
  { question: "Who plays Hopper?", choices: ["David Harbour","Cary Elwes","Joe Keery","Charlie Heaton"], correct: 0 },
  { question: "What's the Demogorgon?", choices: ["Upside Down monster","Boss","Both","Just monster"], correct: 2 },
  { question: "What season has Vecna?", choices: ["Season 4","Season 3","Season 2","Season 1"], correct: 0 },
  { question: "Who plays Vecna/Henry Creel?", choices: ["Jamie Campbell Bower","Joseph Quinn","Joe Keery","Charlie Heaton"], correct: 0 },
  { question: "Who plays Eddie Munson (Season 4)?", choices: ["Joseph Quinn","Jamie Campbell","Joe Keery","Charlie Heaton"], correct: 0 },
  { question: "What song saves Max in Season 4?", choices: ["Running Up That Hill (Kate Bush)","Master of Puppets","Both songs in Season 4","Just Kate Bush"], correct: 0 },
  { question: "What metal song does Eddie play in Season 4?", choices: ["Master of Puppets (Metallica)","Running Up That Hill","Both","Just Metallica"], correct: 0 },
  { question: "Who plays Steve Harrington?", choices: ["Joe Keery","Charlie Heaton","Dacre Montgomery","Jake Busey"], correct: 0 },
  { question: "Who plays Nancy Wheeler?", choices: ["Natalia Dyer","Sadie Sink","Maya Hawke","Joe Keery"], correct: 0 },
  { question: "Who plays Robin (Steve's friend)?", choices: ["Maya Hawke","Natalia Dyer","Sadie Sink","Millie Bobby Brown"], correct: 0 },
  { question: "Who plays Max?", choices: ["Sadie Sink","Maya Hawke","Natalia Dyer","Cara Buono"], correct: 0 },
  { question: "Who plays Billy?", choices: ["Dacre Montgomery","Joe Keery","Charlie Heaton","Jake Busey"], correct: 0 },
  { question: "Who plays Erica Sinclair?", choices: ["Priah Ferguson","Sadie Sink","Maya Hawke","Cara Buono"], correct: 0 },
  { question: "What's the family Pet Hopper had/saved?", choices: ["Yes, deceased daughter Sara","No daughter","Both","Different family"], correct: 0 },
  { question: "What's Eleven's friend with similar abilities?", choices: ["Kali / Eight","Just Kali","Both","Just Eight"], correct: 2 },
  { question: "How many seasons exist?", choices: ["4 with 5th coming/ended","5","Both 4 and 5","Just 4"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: StrangerThingsSettings): StrangerThingsState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: StrangerThingsState, action: StrangerThingsAction): StrangerThingsState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: StrangerThingsState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
