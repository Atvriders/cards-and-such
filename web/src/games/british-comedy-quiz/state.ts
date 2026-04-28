import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BritishComedyQuizSettings { questions: "10" | "20" | "30"; }
export interface BritishComedyQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BritishComedyQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Fawlty Towers ran for how many series?", choices: ["1", "2", "3", "4"], correct: 1 },
  { question: "Fawlty Towers' hotel is in?", choices: ["Torquay", "Brighton", "Bath", "Oxford"], correct: 0 },
  { question: "Manuel in Fawlty Towers is from?", choices: ["Spain (Barcelona)", "Mexico", "Portugal", "Italy"], correct: 0 },
  { question: "Blackadder Sir Edmund played by?", choices: ["Rowan Atkinson", "Hugh Laurie", "Stephen Fry", "Tony Robinson"], correct: 0 },
  { question: "How many Blackadder series?", choices: ["3", "4", "5", "6"], correct: 1 },
  { question: "Baldrick is played by?", choices: ["Tony Robinson", "Hugh Laurie", "Stephen Fry", "Rik Mayall"], correct: 0 },
  { question: "Father Ted is set on?", choices: ["Craggy Island", "Dublin", "Cork", "Galway"], correct: 0 },
  { question: "Father Jack's catchphrase?", choices: ["'DRINK!'", "'Feck'", "'Ah go on'", "All of these"], correct: 3 },
  { question: "Father Ted creator?", choices: ["Graham Linehan", "Richard Curtis", "John Cleese", "Steven Moffat"], correct: 0 },
  { question: "Peep Show is told from?", choices: ["First-person POV", "Flashbacks", "Documentary", "Narration"], correct: 0 },
  { question: "Peep Show duo?", choices: ["Mitchell & Webb", "Mitchell & Pegg", "Webb & Pegg", "Smith & Jones"], correct: 0 },
  { question: "Peep Show ran for how many series?", choices: ["6", "7", "8", "9"], correct: 3 },
  { question: "Yes Minister/Yes Prime Minister starred?", choices: ["Paul Eddington", "John Cleese", "Hugh Laurie", "Stephen Fry"], correct: 0 },
  { question: "Only Fools and Horses Del Boy played by?", choices: ["David Jason", "Nicholas Lyndhurst", "John Sullivan", "Roger Lloyd-Pack"], correct: 0 },
  { question: "Only Fools and Horses location?", choices: ["Peckham", "Hackney", "Brixton", "Camden"], correct: 0 },
  { question: "The Office (UK) creator?", choices: ["Ricky Gervais", "Stephen Merchant", "Both", "Ben Elton"], correct: 2 },
  { question: "David Brent is played by?", choices: ["Ricky Gervais", "Steve Carell", "Mackenzie Crook", "Martin Freeman"], correct: 0 },
  { question: "Extras star?", choices: ["Ricky Gervais", "Steve Coogan", "Larry David", "Hugh Laurie"], correct: 0 },
  { question: "Alan Partridge is played by?", choices: ["Steve Coogan", "Hugh Laurie", "Rowan Atkinson", "Stephen Fry"], correct: 0 },
  { question: "Knowing Me, Knowing You was named after?", choices: ["ABBA song", "Coogan original", "Beatles", "Queen"], correct: 0 },
  { question: "Black Books star?", choices: ["Dylan Moran", "Bill Bailey", "Tamsin Greig", "All three"], correct: 3 },
  { question: "IT Crowd creator?", choices: ["Graham Linehan", "Richard Curtis", "John Lloyd", "Armando Iannucci"], correct: 0 },
  { question: "IT Crowd star?", choices: ["Chris O'Dowd", "Richard Ayoade", "Katherine Parkinson", "All three"], correct: 3 },
  { question: "The Vicar of Dibley star?", choices: ["Dawn French", "Jennifer Saunders", "Joanna Lumley", "Maggie Smith"], correct: 0 },
  { question: "Absolutely Fabulous duo?", choices: ["French & Saunders", "Saunders & Lumley", "French & Henderson", "Lumley & Cleese"], correct: 1 },
  { question: "Mr Bean creator?", choices: ["Atkinson & Curtis", "Atkinson & Cleese", "Atkinson alone", "Atkinson & Lloyd"], correct: 0 },
  { question: "Monty Python created in?", choices: ["1969", "1971", "1975", "1968"], correct: 0 },
  { question: "Spaced creator?", choices: ["Edgar Wright", "Simon Pegg & Jessica Hynes", "Both", "Just Pegg"], correct: 1 },
  { question: "League of Gentlemen setting?", choices: ["Royston Vasey", "Cragmoor", "Ulthar", "Yardley"], correct: 0 },
  { question: "Inbetweeners star?", choices: ["Joe Thomas", "James Buckley", "Simon Bird", "All three plus Blake Harrison"], correct: 3 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: BritishComedyQuizSettings): BritishComedyQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BritishComedyQuizState, action: BritishComedyQuizAction): BritishComedyQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BritishComedyQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
