import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface FeudalJapanQuizSettings { questions: "10" | "20" | "30"; }
export interface FeudalJapanQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type FeudalJapanQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What were Japanese warriors called?", choices: ["Samurai","Ninja","Ronin","Sumo"], correct: 0 },
  { question: "What was the samurai code of ethics called?", choices: ["Bushido","Zen","Wabi-sabi","Mottainai"], correct: 0 },
  { question: "What was the ruling military government called?", choices: ["Shogunate","Caliphate","Daimyate","Sultanate"], correct: 0 },
  { question: "What was the title of the military ruler of Japan?", choices: ["Shogun","Daimyo","Emperor","Samurai"], correct: 0 },
  { question: "What were regional feudal lords called?", choices: ["Daimyo","Shogun","Samurai","Ronin"], correct: 0 },
  { question: "What was a samurai without a master called?", choices: ["Ronin","Ninja","Ashigaru","Bushi"], correct: 0 },
  { question: "Who founded the Tokugawa shogunate?", choices: ["Tokugawa Ieyasu","Toyotomi Hideyoshi","Oda Nobunaga","Minamoto no Yoritomo"], correct: 0 },
  { question: "In what year was the Tokugawa shogunate founded?", choices: ["1192","1338","1603","1868"], correct: 2 },
  { question: "What 1600 battle established Tokugawa power?", choices: ["Sekigahara","Nagashino","Okehazama","Anegawa"], correct: 0 },
  { question: "What policy isolated Japan from the world?", choices: ["Sakoku","Bushido","Bakufu","Han"], correct: 0 },
  { question: "What was the main samurai sword?", choices: ["Katana","Wakizashi","Naginata","Tanto"], correct: 0 },
  { question: "What was the samurai's pair of swords called?", choices: ["Daisho","Bokken","Shinai","Nodachi"], correct: 0 },
  { question: "What 1868 restoration ended feudalism?", choices: ["Meiji Restoration","Tokugawa Restoration","Edo Restoration","Heian Restoration"], correct: 0 },
  { question: "What city did the Tokugawa shoguns rule from?", choices: ["Edo (Tokyo)","Kyoto","Kamakura","Osaka"], correct: 0 },
  { question: "What was the imperial capital throughout the era?", choices: ["Kyoto","Tokyo","Kamakura","Osaka"], correct: 0 },
  { question: "What name is given to the Heian era?", choices: ["794-1185","600-794","1185-1333","1336-1573"], correct: 0 },
  { question: "What was the Sengoku period?", choices: ["Warring States 1467-1615","Heian era","Asuka era","Showa era"], correct: 0 },
  { question: "What was a shoji?", choices: ["Sliding paper door","Sword","Flag","Pottery"], correct: 0 },
  { question: "What was a katana made of?", choices: ["Folded steel","Iron","Bronze","Gold-plated steel"], correct: 0 },
  { question: "What was hara-kiri (seppuku)?", choices: ["Ritual suicide","Tea ceremony","Sword fighting","Battle tactic"], correct: 0 },
  { question: "What was a stealthy spy/assassin called?", choices: ["Ninja or shinobi","Samurai","Ronin","Daimyo"], correct: 0 },
  { question: "What were the three great unifiers of Japan?", choices: ["Oda Nobunaga, Toyotomi Hideyoshi, Tokugawa Ieyasu","Ashikaga, Hojo, Minamoto","Imperial trinity","Three shogun"], correct: 0 },
  { question: "What religion brought Zen Buddhism to samurai?", choices: ["Buddhism","Shinto","Both","Confucianism"], correct: 0 },
  { question: "What is the native Japanese religion?", choices: ["Shinto","Buddhism","Daoism","Confucianism"], correct: 0 },
  { question: "What were the four classes in Tokugawa society?", choices: ["Samurai, peasants, artisans, merchants","Nobles, knights, peasants, slaves","Lords, monks, peasants, beggars","Imperial, military, civil, serf"], correct: 0 },
  { question: "What were Japanese castles built of (typically)?", choices: ["Stone bases with wood","All stone","All wood","Mud and brick"], correct: 0 },
  { question: "What event in 1853 forced Japan to open?", choices: ["Perry's Black Ships","British arrival","Russian fleet","Dutch demands"], correct: 0 },
  { question: "What was a samurai's stipend in?", choices: ["Rice (koku)","Gold","Silver","Land deeds"], correct: 0 },
  { question: "What was the highest mountain in Japan, sacred to samurai culture?", choices: ["Mount Fuji","Mount Tate","Mount Hotaka","Mount Yari"], correct: 0 },
  { question: "What dish came from Edo period eat-on-the-go culture?", choices: ["Sushi","Tempura","Soba","All from Edo era"], correct: 3 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: FeudalJapanQuizSettings): FeudalJapanQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: FeudalJapanQuizState, action: FeudalJapanQuizAction): FeudalJapanQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: FeudalJapanQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
