import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SoccerStarsQuizSettings { questions: "10" | "20" | "30"; }
export interface SoccerStarsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SoccerStarsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who's widely considered the greatest soccer player ever (debate)?", choices: ["Pele or Maradona or Messi","Just one","Multiple","All cited"], correct: 3 },
  { question: "How many World Cups did Pele win?", choices: ["3","2","4","1"], correct: 0 },
  { question: "In what country was Pele born?", choices: ["Brazil","Argentina","Portugal","Just Brazil"], correct: 2 },
  { question: "In what year did Diego Maradona's Hand of God happen?", choices: ["1986","1990","1982","1994"], correct: 0 },
  { question: "Where did Maradona's Hand of God score?", choices: ["1986 World Cup vs England","Just England game","Both","Quarterfinals"], correct: 2 },
  { question: "How many Ballon d'Or has Lionel Messi won?", choices: ["8","7","6","9"], correct: 0 },
  { question: "How many Ballon d'Or has Cristiano Ronaldo won?", choices: ["5","6","4","7"], correct: 0 },
  { question: "What clubs has Messi played for?", choices: ["Barcelona, PSG, Inter Miami","Just Barcelona","Multiple","Just two"], correct: 2 },
  { question: "What clubs has Ronaldo played for?", choices: ["Sporting, Man United, Real Madrid, Juventus, Man United again, Al-Nassr","Just MUFC and RM","Multiple","Just Real"], correct: 2 },
  { question: "In what year did Messi win the World Cup?", choices: ["2022","2018","2014","2010"], correct: 0 },
  { question: "What country does Messi play for?", choices: ["Argentina","Brazil","Spain","Just Argentina"], correct: 2 },
  { question: "What country does Ronaldo play for?", choices: ["Portugal","Spain","Brazil","Just Portugal"], correct: 2 },
  { question: "Who scored 5 World Cup-winning goals in one tournament for Brazil 1970?", choices: ["Pele","Various","Both","Just Pele"], correct: 2 },
  { question: "Who's Johan Cruyff?", choices: ["Dutch legend","Just Dutch","Both","Coach also"], correct: 2 },
  { question: "What's the Cruyff Turn?", choices: ["Famous dribbling move","Just turn","Both","Skill"], correct: 2 },
  { question: "Who's Zinedine Zidane?", choices: ["French legend","Just French","Both","Coach also"], correct: 2 },
  { question: "What did Zidane famously do in 2006 World Cup final?", choices: ["Headbutt Materazzi","Score winner","Both happened in his final tournament","Just headbutt"], correct: 0 },
  { question: "What country won 2014 World Cup?", choices: ["Germany","Brazil","Argentina","Spain"], correct: 0 },
  { question: "What country won 2018 World Cup?", choices: ["France","Croatia","Belgium","Brazil"], correct: 0 },
  { question: "What country won 2022 World Cup?", choices: ["Argentina","France","Brazil","Croatia"], correct: 0 },
  { question: "Who's the all-time top World Cup scorer?", choices: ["Miroslav Klose","Ronaldo (Brazilian)","Both close","Just Klose"], correct: 0 },
  { question: "How many World Cup goals does Klose have?", choices: ["16","15","17","14"], correct: 0 },
  { question: "What's the world's most-watched sport tournament?", choices: ["FIFA World Cup","Olympics","Both global","Just WC"], correct: 2 },
  { question: "How often is the World Cup held?", choices: ["Every 4 years","Every 2 years","Every year","Every 5 years"], correct: 0 },
  { question: "Who's known as El Diego?", choices: ["Maradona","Just Maradona","Both","Diego Forlan"], correct: 0 },
  { question: "What position did Pele play primarily?", choices: ["Forward","Midfielder","Both","Just forward"], correct: 2 },
  { question: "What's the highest-scoring soccer game?", choices: ["Various lopsided matches","Just records","Both","Many"], correct: 0 },
  { question: "What club is Ronaldo most identified with?", choices: ["Real Madrid","Manchester United","Both","Just Real"], correct: 2 },
  { question: "What club is Messi most identified with?", choices: ["Barcelona","PSG","Both","Just Barca"], correct: 2 },
  { question: "What's UEFA Champions League?", choices: ["Top European club competition","Just league","Both","Just continental"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SoccerStarsQuizSettings): SoccerStarsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SoccerStarsQuizState, action: SoccerStarsQuizAction): SoccerStarsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SoccerStarsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
