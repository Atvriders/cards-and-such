import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HinduMythQuizSettings { questions: "10" | "20" | "30"; }
export interface HinduMythQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HinduMythQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What are the three main Hindu gods (Trimurti)?", choices: ["Brahma, Vishnu, Shiva","Krishna, Rama, Hanuman","Indra, Agni, Varuna","Ganesha, Saraswati, Lakshmi"], correct: 0 },
  { question: "What does Brahma do?", choices: ["Creates","Preserves","Destroys","Just god"], correct: 0 },
  { question: "What does Vishnu do?", choices: ["Preserves","Creates","Destroys","Both"], correct: 0 },
  { question: "What does Shiva do?", choices: ["Destroys/Transforms","Creates","Preserves","Both"], correct: 0 },
  { question: "How many avatars does Vishnu have?", choices: ["10 (Dashavatara)","8","12","7"], correct: 0 },
  { question: "Who's the elephant-headed god?", choices: ["Ganesha","Hanuman","Just Ganesha","Both"], correct: 0 },
  { question: "Who's Ganesha's parent?", choices: ["Shiva and Parvati","Just Shiva","Both","Vishnu"], correct: 0 },
  { question: "Who's the monkey god?", choices: ["Hanuman","Ganesha","Just Hanuman","Both"], correct: 0 },
  { question: "Who's the goddess of wealth?", choices: ["Lakshmi","Saraswati","Parvati","Durga"], correct: 0 },
  { question: "Who's the goddess of learning and music?", choices: ["Saraswati","Lakshmi","Both","Just Saraswati"], correct: 0 },
  { question: "Who's Shiva's consort?", choices: ["Parvati","Lakshmi","Saraswati","All Devis"], correct: 0 },
  { question: "Who's the goddess of strength/destruction?", choices: ["Durga","Kali","Both forms of mother","Just Durga"], correct: 2 },
  { question: "Who's Vishnu's avatar in Bhagavad Gita?", choices: ["Krishna","Rama","Both","Just Krishna"], correct: 2 },
  { question: "What's the Bhagavad Gita part of?", choices: ["Mahabharata","Ramayana","Both","Vedas"], correct: 0 },
  { question: "What's the Ramayana about?", choices: ["Lord Rama's life","Just Rama","Both","Just epic"], correct: 2 },
  { question: "Who's Rama's wife?", choices: ["Sita","Radha","Lakshmi","Parvati"], correct: 0 },
  { question: "Who kidnapped Sita?", choices: ["Ravana","Surpanakha","Hiranyakashipu","Mahishasura"], correct: 0 },
  { question: "What's the Mahabharata?", choices: ["Epic about Pandavas vs Kauravas","Just epic","Both","Battle"], correct: 2 },
  { question: "How many Pandava brothers?", choices: ["5","3","7","4"], correct: 0 },
  { question: "Who's the eldest Pandava?", choices: ["Yudhishthira","Bhima","Arjuna","Nakula"], correct: 0 },
  { question: "Who's the great archer Pandava?", choices: ["Arjuna","Bhima","Yudhishthira","Karna"], correct: 0 },
  { question: "Who's Krishna's friend in Mahabharata?", choices: ["Arjuna","Yudhishthira","Bhima","All Pandavas"], correct: 0 },
  { question: "Who's the king of gods?", choices: ["Indra","Brahma","Vishnu","Shiva"], correct: 0 },
  { question: "Who's the god of fire?", choices: ["Agni","Indra","Vayu","Surya"], correct: 0 },
  { question: "Who's the wind god?", choices: ["Vayu","Agni","Indra","Varuna"], correct: 0 },
  { question: "Who's the sun god?", choices: ["Surya","Agni","Vayu","Indra"], correct: 0 },
  { question: "What are the Vedas?", choices: ["Ancient Hindu scriptures","Just stories","Both","Just texts"], correct: 2 },
  { question: "How many main Vedas are there?", choices: ["4","3","5","6"], correct: 0 },
  { question: "What's dharma?", choices: ["Cosmic duty/righteousness","Just duty","Both","Just morality"], correct: 2 },
  { question: "What's karma?", choices: ["Action and consequence","Just fate","Both","Just deed"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: HinduMythQuizSettings): HinduMythQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HinduMythQuizState, action: HinduMythQuizAction): HinduMythQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HinduMythQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
