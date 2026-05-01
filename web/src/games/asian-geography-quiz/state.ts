import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AsianGeographyQuizSettings { questions: "10" | "20" | "30"; }
export interface AsianGeographyQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AsianGeographyQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What is the highest mountain in Asia and the world?", choices: ["K2","Kangchenjunga","Everest","Lhotse"], correct: 2 },
  { question: "Which is the longest river in Asia?", choices: ["Mekong","Ganges","Yangtze","Indus"], correct: 2 },
  { question: "What is the largest country in Asia by area?", choices: ["China","India","Russia","Kazakhstan"], correct: 2 },
  { question: "Mount Fuji is located in which country?", choices: ["China","Japan","South Korea","Taiwan"], correct: 1 },
  { question: "What is the capital of Thailand?", choices: ["Bangkok","Chiang Mai","Phuket","Pattaya"], correct: 0 },
  { question: "Which sea separates Japan from the Korean Peninsula?", choices: ["South China Sea","Yellow Sea","Sea of Japan","Bering Sea"], correct: 2 },
  { question: "What is the largest lake in Asia (also the world's largest by area)?", choices: ["Caspian Sea","Lake Baikal","Aral Sea","Dead Sea"], correct: 0 },
  { question: "Which mountain range separates the Indian subcontinent from Tibet?", choices: ["Karakoram","Himalayas","Hindu Kush","Pamir"], correct: 1 },
  { question: "What is the capital of Vietnam?", choices: ["Ho Chi Minh City","Hanoi","Hue","Da Nang"], correct: 1 },
  { question: "Which country has the most people?", choices: ["China","India","Indonesia","Pakistan"], correct: 1 },
  { question: "The Great Wall is in which country?", choices: ["Mongolia","China","North Korea","Russia"], correct: 1 },
  { question: "What is the deepest lake in the world, located in Russia?", choices: ["Caspian","Aral","Baikal","Issyk-Kul"], correct: 2 },
  { question: "Which country is known as the Land of the Rising Sun?", choices: ["China","Japan","Korea","Thailand"], correct: 1 },
  { question: "What is the capital of Indonesia?", choices: ["Jakarta","Surabaya","Bandung","Bali"], correct: 0 },
  { question: "What strait separates Singapore from Indonesia's Riau Islands?", choices: ["Strait of Malacca","Singapore Strait","Sunda Strait","Lombok Strait"], correct: 1 },
  { question: "Which Asian country shares the longest border with China?", choices: ["India","Mongolia","Russia","Kazakhstan"], correct: 1 },
  { question: "In which country is Angkor Wat?", choices: ["Thailand","Cambodia","Laos","Vietnam"], correct: 1 },
  { question: "What is the capital of South Korea?", choices: ["Pyongyang","Seoul","Busan","Daegu"], correct: 1 },
  { question: "What is the smallest country in Asia by area?", choices: ["Singapore","Bahrain","Maldives","Brunei"], correct: 2 },
  { question: "Which two countries share the island of Borneo with Indonesia?", choices: ["Philippines and Vietnam","Malaysia and Brunei","Thailand and Laos","Singapore and Malaysia"], correct: 1 },
  { question: "What is the holy river of India?", choices: ["Indus","Brahmaputra","Ganges","Yamuna"], correct: 2 },
  { question: "Which is the highest plateau on Earth?", choices: ["Tibetan Plateau","Iranian Plateau","Mongolian Plateau","Deccan Plateau"], correct: 0 },
  { question: "What is the capital of Mongolia?", choices: ["Erdenet","Ulaanbaatar","Darkhan","Khovd"], correct: 1 },
  { question: "Which body of water borders India to the south?", choices: ["Bay of Bengal","Indian Ocean","Arabian Sea","All of these"], correct: 3 },
  { question: "What is the second largest country in Asia by population?", choices: ["India","China","Indonesia","Pakistan"], correct: 1 },
  { question: "In which country is the Gobi Desert primarily located?", choices: ["Kazakhstan","Mongolia and China","Russia","Iran"], correct: 1 },
  { question: "What is the highest peak in Southeast Asia?", choices: ["Mount Kinabalu","Mount Apo","Hkakabo Razi","Puncak Jaya"], correct: 2 },
  { question: "Which Asian country is an archipelago of over 7,000 islands?", choices: ["Indonesia","Japan","Philippines","Malaysia"], correct: 2 },
  { question: "What is the capital of Kazakhstan?", choices: ["Almaty","Astana","Shymkent","Karaganda"], correct: 1 },
  { question: "Which Asian sea is famous for tropical island chains and shallow water?", choices: ["Sea of Japan","Caspian","South China Sea","Aral"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: AsianGeographyQuizSettings): AsianGeographyQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AsianGeographyQuizState, action: AsianGeographyQuizAction): AsianGeographyQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AsianGeographyQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
