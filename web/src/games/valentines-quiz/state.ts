import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ValentinesQuizSettings { questions: "10" | "20" | "30"; }
export interface ValentinesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ValentinesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Valentine's Day is on?", choices: ["February 14", "February 13", "February 15", "February 28"], correct: 0 },
  { question: "Saint Valentine was a?", choices: ["Christian martyr (3rd century Rome)", "Pope", "Saint of Ireland", "Modern figure"], correct: 0 },
  { question: "Symbol most associated with Valentine's?", choices: ["Red heart", "Yellow rose", "White lily", "Olive branch"], correct: 0 },
  { question: "Cupid is the Roman god of?", choices: ["Love (Eros in Greek)", "War", "Wisdom", "Harvest"], correct: 0 },
  { question: "Cupid's parents in Roman mythology?", choices: ["Venus and Mars", "Jupiter and Juno", "Apollo and Diana", "Saturn and Ops"], correct: 0 },
  { question: "Valentine cards were first popularized commercially in?", choices: ["19th-century England (Esther Howland in US)", "1700s", "20th century only", "Ancient Rome"], correct: 0 },
  { question: "Esther Howland is known as?", choices: ["Mother of the American Valentine", "Card store founder", "Hallmark CEO", "Hershey heiress"], correct: 0 },
  { question: "Hallmark Cards launched Valentine cards in?", choices: ["1913", "1950", "1900", "1925"], correct: 0 },
  { question: "What chocolate is most associated with Valentine's?", choices: ["Heart-shaped boxed assortments", "White chocolate only", "Milk chocolate bars", "Truffles only"], correct: 0 },
  { question: "Conversation hearts (candy) are made by?", choices: ["Originally NECCO; now Spangler", "Hershey", "Mars", "Cadbury"], correct: 0 },
  { question: "What Roman February festival predates Valentine's?", choices: ["Lupercalia", "Saturnalia", "Quirinalia", "Bacchanalia"], correct: 0 },
  { question: "Geoffrey Chaucer linked Valentine's Day to romance in?", choices: ["Parlement of Foules (~1382)", "Canterbury Tales", "Troilus and Criseyde", "Knight's Tale"], correct: 0 },
  { question: "Shakespeare mentions Valentine's in?", choices: ["Hamlet (Ophelia's song)", "Romeo and Juliet", "A Midsummer Night's Dream", "Twelfth Night"], correct: 0 },
  { question: "What flower is most given on Valentine's Day?", choices: ["Red roses", "Tulips", "Lilies", "Daisies"], correct: 0 },
  { question: "Most popular non-romantic Valentine demographic?", choices: ["Children at school exchanges", "Coworkers", "Pets", "Politicians"], correct: 0 },
  { question: "What February 1929 Chicago event was 'Valentine's Day Massacre'?", choices: ["Capone-related gangland killings", "Stock crash", "Fire", "Riot"], correct: 0 },
  { question: "Sweetest Day differs from Valentine's because?", choices: ["Mid-October regional US holiday", "Same as Valentine's", "European version", "Religious only"], correct: 0 },
  { question: "Valentine's color scheme?", choices: ["Red, pink, white", "Green, white", "Blue, gold", "Orange, black"], correct: 0 },
  { question: "Galentine's Day was popularized by?", choices: ["Parks and Recreation TV show (Leslie Knope, Feb 13)", "SNL", "Big Bang Theory", "Friends"], correct: 0 },
  { question: "Japanese Valentine's tradition?", choices: ["Women give chocolates to men (giri-choco/honmei-choco)", "Men only give", "No giving", "Roses only"], correct: 0 },
  { question: "Japanese 'White Day' (March 14)?", choices: ["Men reciprocate gifts to women", "Just white candy day", "Wedding day", "Children's day"], correct: 0 },
  { question: "Most popular Valentine's flower color besides red?", choices: ["Pink", "Yellow", "White", "Orange"], correct: 0 },
  { question: "What is the average spend per Valentine in U.S. recently?", choices: ["Around $150-200", "Around $20", "Around $1000", "Around $5"], correct: 0 },
  { question: "Vinegar Valentines were?", choices: ["19th-century insulting cards", "Sweet cards only", "Modern jokes", "Religious tracts"], correct: 0 },
  { question: "What classical music piece is associated with Valentine's romance?", choices: ["Tchaikovsky's Romeo and Juliet Overture (and others)", "1812 Overture", "Pachelbel Canon (mainly weddings, also Valentine's-themed)", "Both 1 and 3"], correct: 3 },
  { question: "Valentine's Day in Finland is?", choices: ["Friend's Day (Ystävänpäivä)", "Romance Day", "Family Day", "Wedding Day"], correct: 0 },
  { question: "Saint Valentine's relics are reportedly at?", choices: ["Whitefriar Street Church, Dublin (some); Rome", "Vatican only", "Westminster", "Cathedral of Cologne"], correct: 0 },
  { question: "Heart shape (♥) doesn't actually depict?", choices: ["A real human heart anatomically", "An ideogram", "A symbol", "A stylized leaf possibility"], correct: 0 },
  { question: "Mass weddings on Valentine's are popular in?", choices: ["The Philippines", "Japan", "Russia", "Brazil"], correct: 0 },
  { question: "What love song is the all-time Valentine standard?", choices: ["My Funny Valentine", "Crazy for You", "I Will Always Love You", "Endless Love"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ValentinesQuizSettings): ValentinesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ValentinesQuizState, action: ValentinesQuizAction): ValentinesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ValentinesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
