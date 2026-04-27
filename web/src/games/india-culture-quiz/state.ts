import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface IndiaCultureQuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface IndiaCultureQuizSettings { questions: "10" | "20"; }
export interface IndiaCultureQuizState { questions: IndiaCultureQuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type IndiaCultureQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: IndiaCultureQuizQuestion[] = [
  { question: "What is the capital of India?", choices: ["Mumbai","Kolkata","New Delhi","Chennai"], correct: 2 },
  { question: "Which festival is the 'Festival of Lights'?", choices: ["Holi","Diwali","Onam","Pongal"], correct: 1 },
  { question: "Bollywood is centered in?", choices: ["Delhi","Mumbai","Bangalore","Chennai"], correct: 1 },
  { question: "The official Hindi greeting is?", choices: ["Salaam","Namaste","Vanakkam","Adab"], correct: 1 },
  { question: "Which is a sacred Hindu river?", choices: ["Indus","Yamuna","Ganges","All of these"], correct: 3 },
  { question: "Taj Mahal was built by?", choices: ["Akbar","Shah Jahan","Aurangzeb","Babur"], correct: 1 },
  { question: "Cricket's IPL stands for?", choices: ["Indian Pro League","Indian Premier League","International Pro League","India Players League"], correct: 1 },
  { question: "Which sari style is from southern India?", choices: ["Banarasi","Kanjivaram","Bandhani","Chanderi"], correct: 1 },
  { question: "Mahatma Gandhi led India to independence in?", choices: ["1942","1947","1950","1965"], correct: 1 },
  { question: "Yoga's traditional language is?", choices: ["Hindi","Tamil","Sanskrit","Urdu"], correct: 2 },
  { question: "Which region is famous for biryani?", choices: ["Punjab","Hyderabad","Kerala","Bengal"], correct: 1 },
  { question: "Holi is the festival of?", choices: ["Lights","Colors","Rains","Harvest"], correct: 1 },
  { question: "India's national animal is?", choices: ["Lion","Bengal Tiger","Elephant","Peacock"], correct: 1 },
  { question: "How many official languages does India recognize in its constitution?", choices: ["12","18","22","28"], correct: 2 },
  { question: "Bharatanatyam is a classical dance from?", choices: ["Kerala","Tamil Nadu","Karnataka","Andhra Pradesh"], correct: 1 },
  { question: "Which religion was founded by Guru Nanak?", choices: ["Jainism","Sikhism","Buddhism","Hinduism"], correct: 1 },
  { question: "Which leader is known as the Iron Man of India?", choices: ["Nehru","Patel","Bose","Tagore"], correct: 1 },
  { question: "The Indus Valley Civilization existed around?", choices: ["1000 BCE","2500 BCE","500 CE","800 BCE"], correct: 1 },
  { question: "Which spice gives curries their yellow color?", choices: ["Cumin","Coriander","Turmeric","Cardamom"], correct: 2 },
  { question: "Shah Rukh Khan is nicknamed?", choices: ["King of Bollywood","Mr. Perfectionist","Big B","Akki"], correct: 0 },
  { question: "Which mountain range borders India to the north?", choices: ["Western Ghats","Aravalli","Himalayas","Vindhya"], correct: 2 },
  { question: "Diwali celebrates the return of which figure?", choices: ["Krishna","Rama","Shiva","Hanuman"], correct: 1 },
  { question: "The Indian rupee symbol was adopted in?", choices: ["2005","2010","2015","2000"], correct: 1 },
  { question: "Which sport is most popular in India?", choices: ["Football","Hockey","Cricket","Kabaddi"], correct: 2 },
  { question: "Bengali poet Tagore won which Nobel?", choices: ["Peace","Literature","Physics","Medicine"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: IndiaCultureQuizSettings): IndiaCultureQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: IndiaCultureQuizState, action: IndiaCultureQuizAction): IndiaCultureQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: IndiaCultureQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
