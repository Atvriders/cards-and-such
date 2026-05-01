import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface DiwaliQuizSettings { questions: "10" | "20" | "30"; }
export interface DiwaliQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type DiwaliQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Diwali is the Hindu festival of?", choices: ["Lights", "Colors", "Water", "Harvest"], correct: 0 },
  { question: "Diwali typically lasts?", choices: ["Five days", "Three days", "One day", "Seven days"], correct: 0 },
  { question: "Main day of Diwali is?", choices: ["Amavasya (new moon) of Kartik month", "Full moon of Kartik", "First day of Hindu new year always", "Spring equinox"], correct: 0 },
  { question: "Diwali typically falls in?", choices: ["October-November (varies)", "June", "March", "August"], correct: 0 },
  { question: "The story most associated with Diwali (Northern India)?", choices: ["Rama's return to Ayodhya after defeating Ravana", "Krishna's birth", "Shiva's marriage", "Ganesha's creation"], correct: 0 },
  { question: "Diwali in southern India often celebrates?", choices: ["Krishna's defeat of Narakasura", "Rama's return primarily", "Birth of Shiva", "Death of Vrtra"], correct: 0 },
  { question: "Goddess Lakshmi is worshipped during?", choices: ["Diwali (Lakshmi Puja)", "Holi", "Navratri only", "Janmashtami"], correct: 0 },
  { question: "What does 'Diwali' or 'Deepavali' mean?", choices: ["Row of lights/lamps", "Festival of color", "Goddess of light", "Day of victory"], correct: 0 },
  { question: "What lamps are lit during Diwali?", choices: ["Diyas (oil lamps)", "Candles only", "Electric only", "Torches"], correct: 0 },
  { question: "Rangoli is?", choices: ["Colorful patterns made on the ground", "A type of sweet", "A song", "A dance"], correct: 0 },
  { question: "Common Diwali sweets?", choices: ["Ladoo, barfi, gulab jamun, jalebi", "Just chocolates", "Cake only", "Pies"], correct: 0 },
  { question: "Fireworks during Diwali symbolize?", choices: ["Triumph of light over darkness, good over evil", "Just celebration", "Money attraction", "Calling ancestors"], correct: 0 },
  { question: "Diwali is celebrated by?", choices: ["Hindus, Sikhs, Jains (and many Buddhists)", "Hindus only", "Sikhs only", "Jains only"], correct: 0 },
  { question: "For Sikhs, Diwali commemorates?", choices: ["Bandi Chhor Divas (release of Guru Hargobind)", "Rama's victory", "Mahavira's nirvana", "Buddha's enlightenment"], correct: 0 },
  { question: "For Jains, Diwali marks?", choices: ["Mahavira's attainment of nirvana", "Mahavira's birth", "Founding of Jainism", "Temple construction"], correct: 0 },
  { question: "Govardhan Puja is celebrated?", choices: ["The day after main Diwali (4th day of festival)", "Same as Diwali", "Before Diwali", "Two weeks later"], correct: 0 },
  { question: "Bhai Dooj is?", choices: ["The 5th day, celebrating brother-sister bond", "First day", "Same as Lakshmi Puja", "Govardhan day"], correct: 0 },
  { question: "Dhanteras is the?", choices: ["First day, dedicated to wealth (Dhanvantari)", "Second day", "Third day", "Last day"], correct: 0 },
  { question: "On Dhanteras, what is traditionally bought?", choices: ["Gold, silver, utensils for prosperity", "Books", "Toys", "Cars"], correct: 0 },
  { question: "Naraka Chaturdashi is?", choices: ["Second day, celebrating Krishna's victory over Narakasura", "Third day", "Last day", "First day"], correct: 0 },
  { question: "The largest Diwali outside India is held in?", choices: ["UK (Leicester) - one of the largest", "Australia", "USA", "Canada"], correct: 0 },
  { question: "Diwali is a public holiday in?", choices: ["India, Nepal, Sri Lanka, several other countries", "India only", "Global universal holiday", "No country officially"], correct: 0 },
  { question: "Diwali is associated with which yantra/symbol?", choices: ["Lotus and Lakshmi imagery", "Cross", "Star", "Crescent"], correct: 0 },
  { question: "Rama is associated with which avatar in Hinduism?", choices: ["Seventh avatar of Vishnu", "Avatar of Shiva", "Avatar of Brahma", "Independent god"], correct: 0 },
  { question: "Ravana was king of?", choices: ["Lanka", "Ayodhya", "Mathura", "Hastinapura"], correct: 0 },
  { question: "Diwali decorations include?", choices: ["Diyas, lanterns, marigold garlands, rangoli", "Christmas trees", "Easter eggs", "Pumpkins"], correct: 0 },
  { question: "What is the new year for many Hindu communities (Vikram Samvat)?", choices: ["Day after Diwali (Gujarati New Year)", "January 1", "March 1", "April 14"], correct: 0 },
  { question: "Holi is sometimes confused with Diwali but is festival of?", choices: ["Colors (spring)", "Lights", "Water", "Harvest"], correct: 0 },
  { question: "What foods are exchanged in 'mithai' boxes?", choices: ["Indian sweets", "Savory snacks only", "Fruits only", "Bread only"], correct: 0 },
  { question: "Why is Lakshmi worshipped on Diwali?", choices: ["She is goddess of wealth and prosperity", "She is goddess of war", "She is goddess of wisdom", "She is goddess of love only"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: DiwaliQuizSettings): DiwaliQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: DiwaliQuizState, action: DiwaliQuizAction): DiwaliQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: DiwaliQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
