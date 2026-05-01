import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface DillingerQuizSettings { questions: "10" | "20"; }
export interface DillingerQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type DillingerQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {"question": "Dillinger's first name?", "choices": ["John", "James", "Joseph", "Jack"], "correct": 0},
  {"question": "In which state was Dillinger born?", "choices": ["Indiana", "Illinois", "Ohio", "Iowa"], "correct": 0},
  {"question": "Year of his death?", "choices": ["1934", "1932", "1936", "1929"], "correct": 0},
  {"question": "Where was he killed?", "choices": ["Biograph Theater", "Lincoln Park", "Union Station", "Wrigley Field"], "correct": 0},
  {"question": "City of his death?", "choices": ["Chicago", "Indianapolis", "St. Louis", "Detroit"], "correct": 0},
  {"question": "Lawman who shot him?", "choices": ["Melvin Purvis", "Frank Hamer", "Eliot Ness", "Bat Masterson"], "correct": 0},
  {"question": "FBI director during Dillinger hunt?", "choices": ["J. Edgar Hoover", "William Burns", "Stanley Finch", "Kelley"], "correct": 0},
  {"question": "Dillinger was named what by FBI?", "choices": ["Public Enemy No. 1", "Most Wanted", "Super Crook", "Top Gun"], "correct": 0},
  {"question": "Which woman betrayed him (Lady in Red)?", "choices": ["Anna Sage", "Polly Hamilton", "Billie Frechette", "Evelyn Frechette"], "correct": 0},
  {"question": "Anna Sage was facing what threat?", "choices": ["Deportation", "Prison", "Execution", "Eviction"], "correct": 0},
  {"question": "Movie playing the night he died?", "choices": ["Manhattan Melodrama", "Public Enemy", "Scarface", "Little Caesar"], "correct": 0},
  {"question": "How did Dillinger break out of Crown Point jail?", "choices": ["Wooden gun", "Real gun", "Bribed guard", "Tunnel"], "correct": 0},
  {"question": "Crown Point jail was in which state?", "choices": ["Indiana", "Illinois", "Ohio", "Wisconsin"], "correct": 0},
  {"question": "Who was Baby Face Nelson?", "choices": ["Dillinger gang member", "Lawman", "Lawyer", "Banker"], "correct": 0},
  {"question": "Pretty Boy Floyd was?", "choices": ["Outlaw", "FBI agent", "Reporter", "Sheriff"], "correct": 0},
  {"question": "Little Bohemia Lodge raid was in?", "choices": ["Wisconsin", "Illinois", "Indiana", "Minnesota"], "correct": 0},
  {"question": "Outcome of Little Bohemia raid?", "choices": ["FBI failure", "Capture", "Death", "No casualty"], "correct": 0},
  {"question": "Dillinger's first major prison sentence was for?", "choices": ["Grocery store robbery", "Bank", "Auto theft", "Murder"], "correct": 0},
  {"question": "Bank Dillinger's gang famously hit in Mason City?", "choices": ["First National", "Bank of Iowa", "Farmers Trust", "Citizens"], "correct": 0},
  {"question": "Which doctor altered Dillinger's face?", "choices": ["Wilhelm Loeser", "Robert Lerch", "John Cassidy", "Fred Ramsey"], "correct": 0},
  {"question": "Dillinger's signature getaway involved?", "choices": ["Stolen V-8 Fords", "Trains", "Horses", "Boats"], "correct": 0},
  {"question": "Which gun did Dillinger reach for at the Biograph?", "choices": ["Colt 1908", "Tommy gun", "BAR", "Luger"], "correct": 0},
  {"question": "Dillinger's father was a?", "choices": ["Grocer", "Farmer", "Banker", "Preacher"], "correct": 0},
  {"question": "Famous quote attributed: 'I rob banks because ___'", "choices": ["that's where the money is", "I'm bored", "I can", "they ask for it"], "correct": 0},
  {"question": "Which actor played Dillinger in 'Public Enemies' (2009)?", "choices": ["Johnny Depp", "Christian Bale", "Brad Pitt", "Mark Ruffalo"], "correct": 0},
  {"question": "Christian Bale played who in same film?", "choices": ["Melvin Purvis", "Hoover", "Capone", "Floyd"], "correct": 0},
  {"question": "How long did Dillinger's main crime spree last?", "choices": ["~14 months", "~3 years", "~5 months", "~10 years"], "correct": 0},
  {"question": "Dillinger's gang killed what banker hostage style?", "choices": ["Used as shield", "Shot", "Released", "Ransomed"], "correct": 0},
  {"question": "Dillinger Sr. capitalized after death by?", "choices": ["Touring with body story", "Suing FBI", "Writing book", "Refusing"], "correct": 0},
  {"question": "Dillinger is buried in?", "choices": ["Crown Hill, Indianapolis", "Chicago", "St. Louis", "Dayton"], "correct": 0}
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: DillingerQuizSettings): DillingerQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questionsArr=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:questionsArr,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: DillingerQuizState, action: DillingerQuizAction): DillingerQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: DillingerQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
