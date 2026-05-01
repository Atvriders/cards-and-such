import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface EasternPhilosophyQuizSettings { questions: "10" | "20" | "30"; }
export interface EasternPhilosophyQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type EasternPhilosophyQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who was Confucius?", choices: ["Chinese philosopher (551-479 BCE)","Just teacher","Both","Just Chinese"], correct: 2 },
  { question: "What's Confucianism's main concern?", choices: ["Social harmony, ethics, virtue","Just ethics","Both","Just family"], correct: 2 },
  { question: "Who founded Taoism (traditionally)?", choices: ["Lao Tzu","Confucius","Buddha","Mencius"], correct: 0 },
  { question: "What's Taoism's main text?", choices: ["Tao Te Ching","Analects","Just Zhuangzi","Both Tao Te Ching and Zhuangzi"], correct: 3 },
  { question: "What's the Tao?", choices: ["The Way / cosmic principle","Just way","Both","Just life"], correct: 2 },
  { question: "What's wu wei?", choices: ["Non-action / effortless action","Just inaction","Both","Just doing"], correct: 2 },
  { question: "What's Yin and Yang?", choices: ["Complementary opposites","Just opposites","Both","Just dualism"], correct: 2 },
  { question: "What's Confucius's main book?", choices: ["The Analects","Mencius","Tao Te Ching","Book of Changes"], correct: 0 },
  { question: "What's filial piety?", choices: ["Respect for parents/elders","Just respect","Both","Just family"], correct: 2 },
  { question: "What does ren mean (Confucian)?", choices: ["Benevolence/humanity","Just kindness","Both","Just virtue"], correct: 2 },
  { question: "What does li mean (Confucian)?", choices: ["Ritual propriety","Just ritual","Both","Just behavior"], correct: 2 },
  { question: "Who was Mencius?", choices: ["Confucian philosopher","Taoist","Both","Just Confucian"], correct: 0 },
  { question: "Who was Zhuangzi?", choices: ["Taoist philosopher","Confucian","Both","Just Taoist"], correct: 0 },
  { question: "What's the butterfly dream associated with?", choices: ["Zhuangzi","Lao Tzu","Confucius","Mencius"], correct: 0 },
  { question: "What's Buddhism's main goal?", choices: ["Nirvana / enlightenment","Just enlightenment","Both","Just liberation"], correct: 2 },
  { question: "What's the Eightfold Path?", choices: ["Buddhist guide to ending suffering","Just guide","Both","Just path"], correct: 2 },
  { question: "What's the Bhagavad Gita's central teaching?", choices: ["Duty (dharma) and yoga paths","Just duty","Both","Just yoga"], correct: 2 },
  { question: "What's karma in Eastern thought?", choices: ["Action and consequence","Just deed","Both","Just fate"], correct: 2 },
  { question: "What's reincarnation?", choices: ["Cycle of rebirth","Just rebirth","Both","Just samsara"], correct: 2 },
  { question: "What's moksha in Hinduism?", choices: ["Liberation from samsara","Just freedom","Both","Just nirvana"], correct: 2 },
  { question: "What's Zen Buddhism's emphasis?", choices: ["Direct experience, meditation","Just meditation","Both","Just experience"], correct: 2 },
  { question: "What's a koan?", choices: ["Zen paradox for meditation","Just question","Both","Just statement"], correct: 2 },
  { question: "What's Bushido?", choices: ["Samurai code of honor","Just code","Both","Just samurai"], correct: 2 },
  { question: "What's the I Ching?", choices: ["Book of Changes / divination","Just divination","Both","Just book"], correct: 2 },
  { question: "What's Legalism in Chinese philosophy?", choices: ["Strict laws/punishment school","Just law","Both","Just rules"], correct: 2 },
  { question: "Who was Han Feizi?", choices: ["Legalist philosopher","Confucian","Both","Just Legalist"], correct: 0 },
  { question: "What's Mohism?", choices: ["School emphasizing universal love","Just love","Both","Just school"], correct: 2 },
  { question: "Who founded Mohism?", choices: ["Mozi","Mencius","Confucius","Lao Tzu"], correct: 0 },
  { question: "What's the Five Classics?", choices: ["Confucian foundational texts","Just texts","Both","Just classics"], correct: 2 },
  { question: "What's the Four Books?", choices: ["Neo-Confucian core texts","Just books","Both","Just four"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: EasternPhilosophyQuizSettings): EasternPhilosophyQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: EasternPhilosophyQuizState, action: EasternPhilosophyQuizAction): EasternPhilosophyQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: EasternPhilosophyQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
