import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface StrangerThingsSettings { questions: "10" | "20" | "30"; }
export interface StrangerThingsState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type StrangerThingsAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Stranger Things is set in?", choices: ["Hawkins, Indiana","Derry, Maine","Rosewood","Riverdale"], correct: 0 },
  { question: "Show creators?", choices: ["The Duffer Brothers","JJ Abrams","Sam Esmail","Ryan Murphy"], correct: 0 },
  { question: "The girl with powers?", choices: ["Eleven","Twelve","Nine","One"], correct: 0 },
  { question: "Eleven's actor?", choices: ["Millie Bobby Brown","Sadie Sink","Natalia Dyer","Gaten Matarazzo"], correct: 0 },
  { question: "The other dimension is?", choices: ["The Upside Down","The Other Side","The Void","The Beyond"], correct: 0 },
  { question: "Kids' D&D group includes?", choices: ["Mike, Will, Lucas, Dustin","Steve","Nancy","Jonathan"], correct: 0 },
  { question: "Will Byers is played by?", choices: ["Noah Schnapp","Finn Wolfhard","Caleb McLaughlin","Gaten"], correct: 0 },
  { question: "Chief of police?", choices: ["Hopper","Bauer","Banks","Wickerly"], correct: 0 },
  { question: "Mike's sister?", choices: ["Nancy","Robin","Max","Erica"], correct: 0 },
  { question: "Joyce Byers is played by?", choices: ["Winona Ryder","Tilda Swinton","Cate Blanchett","Jodie Foster"], correct: 0 },
  { question: "Demogorgon comes from?", choices: ["The Upside Down","Sky","Sea","Earth"], correct: 0 },
  { question: "Steve Harrington's hair?", choices: ["Iconic","Bald","Shaved","Curly"], correct: 0 },
  { question: "Dustin's nickname?", choices: ["Dusty Bun","D","Crusty","Ducky"], correct: 0 },
  { question: "The Russians are at?", choices: ["Starcourt Mall","Downtown","School","Lab"], correct: 0 },
  { question: "Eddie Munson plays?", choices: ["D&D / guitar","Football","Basketball","Music"], correct: 0 },
  { question: "Vecna is the villain in?", choices: ["Season 4","Season 1","Season 2","Season 3"], correct: 0 },
  { question: "Show first aired in?", choices: ["2016","2015","2017","2018"], correct: 0 },
  { question: "Eleven's powers come from?", choices: ["Lab experiments","Birth","Magic","Aliens"], correct: 0 },
  { question: "Network?", choices: ["Netflix","HBO","Amazon","AMC"], correct: 0 },
  { question: "Max's full name?", choices: ["Maxine Mayfield","Maxwell","Max Hop","Max Wheeler"], correct: 0 },
  { question: "Kate Bush song key in S4?", choices: ["Running Up That Hill","Cloudbusting","Wuthering","Hounds"], correct: 0 },
  { question: "Hopper's daughter (deceased)?", choices: ["Sara","Jane","Sam","Sue"], correct: 0 },
  { question: "Lucas's sister?", choices: ["Erica","Robin","Max","Nancy"], correct: 0 },
  { question: "Robin Buckley works at?", choices: ["Scoops Ahoy / video store","Mall","School","Hospital"], correct: 0 },
  { question: "Will's older brother?", choices: ["Jonathan","Steve","Lucas","Mike"], correct: 0 },
  { question: "Game master usually?", choices: ["Mike","Lucas","Will","Dustin"], correct: 0 },
  { question: "Mind Flayer takes over?", choices: ["Will and Billy","Steve","Mike","Eleven"], correct: 0 },
  { question: "Setting decade?", choices: ["1980s","1970s","1990s","2000s"], correct: 0 },
  { question: "Dr. Brenner's nickname?", choices: ["Papa","Doc","Dad","Boss"], correct: 0 },
  { question: "Eggos are eaten by?", choices: ["Eleven","Mike","Nancy","Hopper"], correct: 0 },
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
