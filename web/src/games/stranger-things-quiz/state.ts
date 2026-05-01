import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface StrangerThingsSettings { questions: "10" | "20" | "30"; }
export interface StrangerThingsState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type StrangerThingsAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What town is Stranger Things set in?", choices: ["Hawkins","Derry","Springwood","Stars Hollow"], correct: 0 },
  { question: "What state is Hawkins in?", choices: ["Indiana","Ohio","Illinois","Michigan"], correct: 0 },
  { question: "Who created Stranger Things?", choices: ["The Duffer Brothers","J.J. Abrams","Damon Lindelof","Vince Gilligan"], correct: 0 },
  { question: "What network streams Stranger Things?", choices: ["Netflix","Hulu","HBO","Disney+"], correct: 0 },
  { question: "Who plays Eleven?", choices: ["Millie Bobby Brown","Sadie Sink","Natalia Dyer","Maya Hawke"], correct: 0 },
  { question: "Who plays Mike Wheeler?", choices: ["Finn Wolfhard","Gaten Matarazzo","Caleb McLaughlin","Noah Schnapp"], correct: 0 },
  { question: "Who plays Dustin Henderson?", choices: ["Gaten Matarazzo","Finn Wolfhard","Caleb McLaughlin","Noah Schnapp"], correct: 0 },
  { question: "Who plays Lucas Sinclair?", choices: ["Caleb McLaughlin","Gaten Matarazzo","Finn Wolfhard","Noah Schnapp"], correct: 0 },
  { question: "Who plays Will Byers?", choices: ["Noah Schnapp","Finn Wolfhard","Gaten Matarazzo","Caleb McLaughlin"], correct: 0 },
  { question: "Who plays Jim Hopper?", choices: ["David Harbour","Winona Ryder","Sean Astin","Cary Elwes"], correct: 0 },
  { question: "Who plays Joyce Byers?", choices: ["Winona Ryder","Cara Buono","Maya Hawke","Natalia Dyer"], correct: 0 },
  { question: "What is the alternate dimension called?", choices: ["The Upside Down","The Other Side","The Void","The Mirror Realm"], correct: 0 },
  { question: "What is the Season 1 main monster called?", choices: ["Demogorgon","Mind Flayer","Vecna","Demodog"], correct: 0 },
  { question: "What is the Season 2 villain entity called?", choices: ["The Mind Flayer","Demogorgon","Vecna","The Shadow"], correct: 0 },
  { question: "What is the Season 4 main villain?", choices: ["Vecna","Mind Flayer","Demogorgon","Hopper"], correct: 0 },
  { question: "What government agency experiments on Eleven?", choices: ["Hawkins National Lab","CIA","NSA","FBI"], correct: 0 },
  { question: "Who plays Steve Harrington?", choices: ["Joe Keery","Dacre Montgomery","Charlie Heaton","Jamie Campbell Bower"], correct: 0 },
  { question: "Who plays Nancy Wheeler?", choices: ["Natalia Dyer","Sadie Sink","Maya Hawke","Cara Buono"], correct: 0 },
  { question: "Who plays Robin Buckley?", choices: ["Maya Hawke","Natalia Dyer","Sadie Sink","Millie Bobby Brown"], correct: 0 },
  { question: "Who plays Max Mayfield?", choices: ["Sadie Sink","Maya Hawke","Natalia Dyer","Millie Bobby Brown"], correct: 0 },
  { question: "What is Eleven's official lab number?", choices: ["011","012","007","000"], correct: 0 },
  { question: "What 80s board game inspires monster names?", choices: ["Dungeons & Dragons","Risk","Monopoly","Clue"], correct: 0 },
  { question: "In what decade is the show set?", choices: ["1980s","1970s","1990s","2000s"], correct: 0 },
  { question: "What song saves Max from Vecna?", choices: ["Running Up That Hill","Africa","Thriller","Take On Me"], correct: 0 },
  { question: "Who sings 'Running Up That Hill'?", choices: ["Kate Bush","Madonna","Cyndi Lauper","Pat Benatar"], correct: 0 },
  { question: "Who plays Vecna/Henry Creel?", choices: ["Jamie Campbell Bower","Dacre Montgomery","Joe Keery","Charlie Heaton"], correct: 0 },
  { question: "Who plays Eddie Munson?", choices: ["Joseph Quinn","Joe Keery","Dacre Montgomery","Charlie Heaton"], correct: 0 },
  { question: "What instrument does Eddie famously play in Season 4?", choices: ["Electric guitar","Drums","Bass","Keyboard"], correct: 0 },
  { question: "What ice cream shop does Steve work at?", choices: ["Scoops Ahoy","Dairy Queen","Cold Stone","Sweet Treats"], correct: 0 },
  { question: "What year does Season 1 take place?", choices: ["1983","1984","1985","1986"], correct: 0 },
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
