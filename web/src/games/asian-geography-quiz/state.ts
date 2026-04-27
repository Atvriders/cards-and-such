import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AsianGeographyQuizSettings { questions: "10" | "20" | "30"; }
export interface AsianGeographyQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AsianGeographyQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Capital of Japan?", choices: ["Tokyo","Osaka","Kyoto","Nagoya"], correct: 0 },
  { question: "Capital of China?", choices: ["Shanghai","Beijing","Guangzhou","Shenzhen"], correct: 1 },
  { question: "Capital of South Korea?", choices: ["Busan","Seoul","Incheon","Daegu"], correct: 1 },
  { question: "Capital of North Korea?", choices: ["Hamhung","Wonsan","Pyongyang","Chongjin"], correct: 2 },
  { question: "Capital of Vietnam?", choices: ["Ho Chi Minh City","Hanoi","Da Nang","Hue"], correct: 1 },
  { question: "Capital of Thailand?", choices: ["Chiang Mai","Bangkok","Phuket","Pattaya"], correct: 1 },
  { question: "Capital of Cambodia?", choices: ["Siem Reap","Phnom Penh","Battambang","Sihanoukville"], correct: 1 },
  { question: "Capital of Laos?", choices: ["Luang Prabang","Vientiane","Pakse","Savannakhet"], correct: 1 },
  { question: "Capital of Myanmar?", choices: ["Yangon","Mandalay","Naypyidaw","Bagan"], correct: 2 },
  { question: "Capital of Indonesia?", choices: ["Surabaya","Jakarta","Bandung","Medan"], correct: 1 },
  { question: "Capital of Philippines?", choices: ["Cebu","Quezon","Manila","Davao"], correct: 2 },
  { question: "Capital of Malaysia?", choices: ["Penang","Kuala Lumpur","Johor Bahru","Kuching"], correct: 1 },
  { question: "Capital of Singapore?", choices: ["Singapore","Johor","Sentosa","No capital"], correct: 0 },
  { question: "Capital of India?", choices: ["Mumbai","Kolkata","New Delhi","Chennai"], correct: 2 },
  { question: "Capital of Pakistan?", choices: ["Karachi","Lahore","Islamabad","Peshawar"], correct: 2 },
  { question: "Capital of Bangladesh?", choices: ["Chittagong","Dhaka","Khulna","Rajshahi"], correct: 1 },
  { question: "Capital of Sri Lanka (commercial)?", choices: ["Sri Jayawardenepura Kotte","Colombo","Kandy","Galle"], correct: 1 },
  { question: "Capital of Nepal?", choices: ["Pokhara","Kathmandu","Lalitpur","Bharatpur"], correct: 1 },
  { question: "Capital of Bhutan?", choices: ["Paro","Thimphu","Punakha","Phuentsholing"], correct: 1 },
  { question: "Capital of Mongolia?", choices: ["Erdenet","Ulaanbaatar","Darkhan","Choibalsan"], correct: 1 },
  { question: "Capital of Kazakhstan?", choices: ["Almaty","Astana","Shymkent","Karaganda"], correct: 1 },
  { question: "Capital of Uzbekistan?", choices: ["Samarkand","Tashkent","Bukhara","Khiva"], correct: 1 },
  { question: "Capital of Kyrgyzstan?", choices: ["Osh","Bishkek","Jalal-Abad","Tokmok"], correct: 1 },
  { question: "Capital of Tajikistan?", choices: ["Khujand","Dushanbe","Kulob","Istaravshan"], correct: 1 },
  { question: "Capital of Turkmenistan?", choices: ["Ashgabat","Mary","Turkmenbashi","Dasoguz"], correct: 0 },
  { question: "Capital of Afghanistan?", choices: ["Kandahar","Herat","Kabul","Mazar-i-Sharif"], correct: 2 },
  { question: "Capital of Iran?", choices: ["Isfahan","Tehran","Mashhad","Shiraz"], correct: 1 },
  { question: "Capital of Iraq?", choices: ["Basra","Mosul","Baghdad","Erbil"], correct: 2 },
  { question: "Highest mountain in Asia (and world)?", choices: ["K2","Kangchenjunga","Everest","Lhotse"], correct: 2 },
  { question: "Largest country in Asia by area?", choices: ["China","India","Russia","Kazakhstan"], correct: 2 },
  { question: "Most populous country in Asia (recent)?", choices: ["China","India","Indonesia","Japan"], correct: 1 },
  { question: "Which sea borders Vietnam to the east?", choices: ["South China Sea","Sea of Japan","Yellow Sea","Bay of Bengal"], correct: 0 },
  { question: "Which strait separates Malaysia and Indonesia?", choices: ["Bering","Malacca","Bosporus","Hormuz"], correct: 1 },
  { question: "Largest lake in Asia (and world)?", choices: ["Caspian Sea","Lake Baikal","Aral Sea","Dead Sea"], correct: 0 },
  { question: "Lake Baikal is in which country?", choices: ["China","Mongolia","Russia","Kazakhstan"], correct: 2 },
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
