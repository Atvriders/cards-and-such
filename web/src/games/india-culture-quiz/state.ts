import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface IndiaCultureQuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface IndiaCultureQuizSettings { questions: "10" | "20"; }
export interface IndiaCultureQuizState { questions: IndiaCultureQuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type IndiaCultureQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: IndiaCultureQuizQuestion[] = [
  { question: "What is the capital of India?", choices: ["Mumbai","Kolkata","New Delhi","Chennai"], correct: 2 },
  { question: "Which festival is known as the 'Festival of Lights'?", choices: ["Holi","Diwali","Onam","Pongal"], correct: 1 },
  { question: "The Hindi film industry is centered in which city?", choices: ["Delhi","Mumbai","Bangalore","Chennai"], correct: 1 },
  { question: "The traditional greeting 'Namaste' originates from which language?", choices: ["Tamil","Sanskrit","Bengali","Urdu"], correct: 1 },
  { question: "The Taj Mahal was built by which Mughal emperor?", choices: ["Akbar","Aurangzeb","Shah Jahan","Babur"], correct: 2 },
  { question: "India gained independence from Britain in?", choices: ["1942","1945","1947","1950"], correct: 2 },
  { question: "Mahatma Gandhi led which form of resistance?", choices: ["Armed revolt","Nonviolent (satyagraha)","Boycotts only","Diplomatic letters"], correct: 1 },
  { question: "Which river is considered most sacred in Hinduism?", choices: ["Yamuna","Ganges","Indus","Godavari"], correct: 1 },
  { question: "The Indian national epic featuring Rama is the?", choices: ["Mahabharata","Ramayana","Bhagavad Gita","Vedas"], correct: 1 },
  { question: "Which spice gives many curries their golden color?", choices: ["Garam masala","Turmeric","Coriander","Cumin"], correct: 1 },
  { question: "Tandoori cooking uses what type of oven?", choices: ["Wood pit","Clay cylinder","Iron stove","Brick dome"], correct: 1 },
  { question: "Biryani is primarily a dish of?", choices: ["Stir-fried noodles","Layered rice and meat","Grilled bread","Lentil stew"], correct: 1 },
  { question: "Which is India's most populous state?", choices: ["Maharashtra","Uttar Pradesh","Bihar","West Bengal"], correct: 1 },
  { question: "The Himalayas form India's border with which country?", choices: ["Pakistan","China","Myanmar","Sri Lanka"], correct: 1 },
  { question: "India's first Prime Minister was?", choices: ["Jawaharlal Nehru","Indira Gandhi","Sardar Patel","B.R. Ambedkar"], correct: 0 },
  { question: "Sachin Tendulkar is a legend of which sport?", choices: ["Hockey","Cricket","Football","Badminton"], correct: 1 },
  { question: "Bharatanatyam is a classical dance from which region?", choices: ["Kerala","Tamil Nadu","Punjab","Odisha"], correct: 1 },
  { question: "Sitar virtuoso Ravi Shankar played which instrument?", choices: ["Tabla","Sitar","Sarod","Bansuri"], correct: 1 },
  { question: "The Indus Valley Civilization flourished around?", choices: ["3300-1300 BCE","1500-500 BCE","500 BCE-500 CE","500-1500 CE"], correct: 0 },
  { question: "Which religion was founded by Guru Nanak?", choices: ["Jainism","Sikhism","Buddhism","Hinduism"], correct: 1 },
  { question: "The Golden Temple is located in?", choices: ["Delhi","Amritsar","Varanasi","Ajmer"], correct: 1 },
  { question: "Which mountain range runs along India's western coast?", choices: ["Aravalli","Western Ghats","Vindhya","Satpura"], correct: 1 },
  { question: "Naan bread is traditionally cooked in a?", choices: ["Wok","Tandoor","Skillet","Steamer"], correct: 1 },
  { question: "Dal refers to which kind of dish?", choices: ["Bread","Lentils","Yogurt","Chutney"], correct: 1 },
  { question: "Holi is best known as the festival of?", choices: ["Lights","Colors","Harvest","New Year"], correct: 1 },
  { question: "Which is India's largest city by population?", choices: ["Delhi","Mumbai","Kolkata","Bengaluru"], correct: 1 },
  { question: "Mother Teresa worked primarily in which Indian city?", choices: ["Mumbai","Kolkata","Chennai","Hyderabad"], correct: 1 },
  { question: "Which body of water lies south of India?", choices: ["Arabian Sea","Bay of Bengal","Indian Ocean","Andaman Sea"], correct: 2 },
  { question: "Yoga has its roots in which ancient tradition?", choices: ["Buddhist","Hindu","Jain","Sikh"], correct: 1 },
  { question: "The actor known as the 'King of Bollywood' is?", choices: ["Aamir Khan","Shah Rukh Khan","Salman Khan","Hrithik Roshan"], correct: 1 }
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
