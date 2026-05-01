import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface GoTSettings { questions: "10" | "20" | "30"; }
export interface GoTState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type GoTAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who wrote the books Game of Thrones is based on?", choices: ["George R.R. Martin","J.R.R. Tolkien","Brandon Sanderson","Robert Jordan"], correct: 0 },
  { question: "What is the book series called?", choices: ["A Song of Ice and Fire","The Lord of the Rings","The Wheel of Time","The Stormlight Archive"], correct: 0 },
  { question: "What network aired Game of Thrones?", choices: ["HBO","Netflix","AMC","Showtime"], correct: 0 },
  { question: "How many seasons does Game of Thrones have?", choices: ["8","7","9","10"], correct: 0 },
  { question: "Who is the King in the North (Robb's title)?", choices: ["Robb Stark","Jon Snow","Eddard Stark","Bran Stark"], correct: 0 },
  { question: "Who is known as the Mother of Dragons?", choices: ["Daenerys Targaryen","Cersei Lannister","Sansa Stark","Margaery Tyrell"], correct: 0 },
  { question: "What house's words are 'Winter is Coming'?", choices: ["Stark","Lannister","Targaryen","Baratheon"], correct: 0 },
  { question: "What house's words are 'Hear Me Roar'?", choices: ["Lannister","Stark","Tully","Tyrell"], correct: 0 },
  { question: "Who plays Tyrion Lannister?", choices: ["Peter Dinklage","Nikolaj Coster-Waldau","Lena Headey","Kit Harington"], correct: 0 },
  { question: "Who plays Jon Snow?", choices: ["Kit Harington","Richard Madden","Aidan Gillen","Iwan Rheon"], correct: 0 },
  { question: "Who plays Daenerys Targaryen?", choices: ["Emilia Clarke","Lena Headey","Sophie Turner","Maisie Williams"], correct: 0 },
  { question: "Who plays Cersei Lannister?", choices: ["Lena Headey","Emilia Clarke","Michelle Fairley","Carice van Houten"], correct: 0 },
  { question: "Who plays Arya Stark?", choices: ["Maisie Williams","Sophie Turner","Emilia Clarke","Natalie Dormer"], correct: 0 },
  { question: "Who plays Sansa Stark?", choices: ["Sophie Turner","Maisie Williams","Emilia Clarke","Carice van Houten"], correct: 0 },
  { question: "Who is the Hand of the King under Robert Baratheon?", choices: ["Eddard Stark","Tyrion Lannister","Tywin Lannister","Jon Arryn (then Ned)"], correct: 0 },
  { question: "Who beheads Eddard Stark?", choices: ["Ilyn Payne","Joffrey","Cersei","The Hound"], correct: 0 },
  { question: "What is the name of Daenerys's three dragons?", choices: ["Drogon, Rhaegal, Viserion","Smaug, Drogon, Viserion","Drogo, Visery, Rhaegar","Balerion, Vermithrax, Vhagar"], correct: 0 },
  { question: "Which dragon does Daenerys ride?", choices: ["Drogon","Rhaegal","Viserion","Balerion"], correct: 0 },
  { question: "Who is known as 'The Imp'?", choices: ["Tyrion Lannister","Varys","Littlefinger","Bronn"], correct: 0 },
  { question: "What is the capital of the Seven Kingdoms?", choices: ["King's Landing","Winterfell","Casterly Rock","Dragonstone"], correct: 0 },
  { question: "Who sits the Iron Throne at series start?", choices: ["Robert Baratheon","Joffrey","Aerys II","Stannis"], correct: 0 },
  { question: "What is the name of the wall guarding the North?", choices: ["The Wall","Hadrian's Wall","Great Wall","The Barrier"], correct: 0 },
  { question: "Who leads the Night's Watch in Season 1?", choices: ["Jeor Mormont","Jon Snow","Alliser Thorne","Benjen Stark"], correct: 0 },
  { question: "What army is composed of unsullied warriors?", choices: ["The Unsullied","Dothraki","Golden Company","Second Sons"], correct: 0 },
  { question: "Who is Daenerys's Khal husband?", choices: ["Khal Drogo","Khal Pono","Khal Jhaqo","Khal Moro"], correct: 0 },
  { question: "Who killed the Mad King?", choices: ["Jaime Lannister","Robert Baratheon","Eddard Stark","Tywin Lannister"], correct: 0 },
  { question: "What is the proper Targaryen name for Jon Snow?", choices: ["Aegon Targaryen","Rhaegar","Viserys","Jaehaerys"], correct: 0 },
  { question: "Who finally sits the throne (well, becomes King) at the end?", choices: ["Bran Stark","Jon Snow","Sansa","Tyrion"], correct: 0 },
  { question: "Where is Sansa crowned Queen?", choices: ["Winterfell (Queen in the North)","King's Landing","Dragonstone","The Eyrie"], correct: 0 },
  { question: "Which character says 'You know nothing, Jon Snow'?", choices: ["Ygritte","Daenerys","Sansa","Melisandre"], correct: 0 },
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
