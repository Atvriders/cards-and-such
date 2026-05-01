import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface ChinaHistoryQuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ChinaHistoryQuizSettings { questions: "10" | "20"; }
export interface ChinaHistoryQuizState { questions: ChinaHistoryQuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ChinaHistoryQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: ChinaHistoryQuizQuestion[] = [
  { question: "Who was the first emperor to unify China in 221 BCE?", choices: ["Liu Bang","Qin Shi Huang","Han Wudi","Kublai Khan"], correct: 1 },
  { question: "The Great Wall was primarily built to defend against?", choices: ["Japanese pirates","Mongols and northern nomads","Russians","Vietnamese"], correct: 1 },
  { question: "Which dynasty immediately followed the Qin?", choices: ["Tang","Song","Han","Ming"], correct: 2 },
  { question: "Confucius lived during which period?", choices: ["Spring and Autumn","Warring States","Han","Tang"], correct: 0 },
  { question: "The Silk Road flourished under which dynasty?", choices: ["Shang","Tang","Yuan","Qing"], correct: 1 },
  { question: "Genghis Khan founded which empire?", choices: ["Mongol","Manchu","Khitan","Jurchen"], correct: 0 },
  { question: "The Ming dynasty was founded in?", choices: ["1206","1368","1644","1912"], correct: 1 },
  { question: "The Forbidden City was built during which dynasty?", choices: ["Yuan","Ming","Qing","Tang"], correct: 1 },
  { question: "The last imperial dynasty of China was the?", choices: ["Ming","Qing","Han","Tang"], correct: 1 },
  { question: "The Republic of China was founded in?", choices: ["1898","1911","1919","1927"], correct: 1 },
  { question: "Mao Zedong proclaimed the People's Republic in?", choices: ["1945","1949","1950","1956"], correct: 1 },
  { question: "The Long March took place in which years?", choices: ["1927-28","1934-35","1941-42","1949-50"], correct: 1 },
  { question: "What is China's capital?", choices: ["Shanghai","Beijing","Guangzhou","Xi'an"], correct: 1 },
  { question: "Which river is known as 'China's Sorrow'?", choices: ["Yangtze","Yellow River","Pearl River","Mekong"], correct: 1 },
  { question: "The Terracotta Army was built for which emperor?", choices: ["Han Wudi","Qin Shi Huang","Tang Taizong","Kangxi"], correct: 1 },
  { question: "Which dynasty saw advances in gunpowder, printing and the compass?", choices: ["Han","Tang","Song","Ming"], correct: 2 },
  { question: "The Boxer Rebellion occurred around which year?", choices: ["1850","1900","1925","1949"], correct: 1 },
  { question: "The Three Gorges Dam spans which river?", choices: ["Yellow","Yangtze","Pearl","Mekong"], correct: 1 },
  { question: "Peking duck is associated with which city?", choices: ["Shanghai","Beijing","Chengdu","Hong Kong"], correct: 1 },
  { question: "Sichuan cuisine is famous for which flavor?", choices: ["Sweet","Numbing-spicy","Sour","Salty-mild"], correct: 1 },
  { question: "Dim sum is a tradition originating in which region?", choices: ["Sichuan","Cantonese (Guangdong)","Shandong","Hunan"], correct: 1 },
  { question: "Mt. Everest sits on China's border with which country?", choices: ["India","Nepal","Bhutan","Pakistan"], correct: 1 },
  { question: "Hong Kong was returned to China in?", choices: ["1984","1997","1999","2003"], correct: 1 },
  { question: "Sun Yat-sen is considered the father of?", choices: ["Modern China","Communist Party","People's Liberation Army","Cultural Revolution"], correct: 0 },
  { question: "Which philosopher wrote the 'Tao Te Ching'?", choices: ["Confucius","Laozi","Mencius","Zhuangzi"], correct: 1 },
  { question: "The Cultural Revolution lasted approximately?", choices: ["1949-59","1958-62","1966-76","1978-89"], correct: 2 },
  { question: "Which Chinese dish is stir-fried diced chicken with peanuts and chilies?", choices: ["Mapo tofu","Kung Pao chicken","Char siu","Sweet and sour pork"], correct: 1 },
  { question: "The poet Li Bai is famous as a Tang-era?", choices: ["General","Poet","Emperor","Painter"], correct: 1 },
  { question: "Which city served as the Tang dynasty capital?", choices: ["Luoyang","Chang'an (Xi'an)","Kaifeng","Nanjing"], correct: 1 },
  { question: "The Treaty of Nanking (1842) ended which conflict?", choices: ["First Opium War","Second Opium War","Sino-Japanese War","Boxer Rebellion"], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ChinaHistoryQuizSettings): ChinaHistoryQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ChinaHistoryQuizState, action: ChinaHistoryQuizAction): ChinaHistoryQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ChinaHistoryQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
