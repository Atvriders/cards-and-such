import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion { question: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface PMState { questions: QuizQuestion[]; currentIndex: number; selected: number|null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing"|"result"|"done"; }
export type PMAction = { type:"select"; choice:number } | { type:"submit" } | { type:"next" } | { type:"tick" };
export interface PMSettings { questions: "10"|"20"|"30"; }

const ALL_Q: QuizQuestion[] = [
  { question:"Who was the first Prime Minister of the United Kingdom?", choices:["William Pitt the Elder","Robert Walpole","William Pitt the Younger","Henry Pelham"], correct:1 },
  { question:"Winston Churchill served as PM during which war?", choices:["WWI","WWII","Boer War","Korean War"], correct:1 },
  { question:"Margaret Thatcher was the UK's first female PM — which party did she lead?", choices:["Labour","Liberal","Conservative","SNP"], correct:2 },
  { question:"Which UK PM signed the Munich Agreement with Hitler in 1938?", choices:["Stanley Baldwin","Neville Chamberlain","Winston Churchill","Anthony Eden"], correct:1 },
  { question:"Tony Blair's government introduced which landmark constitutional reform in 1997?", choices:["NHS creation","Scottish and Welsh devolution","EU membership","Privatisation of British Rail"], correct:1 },
  { question:"Who was Canada's first Prime Minister?", choices:["Wilfrid Laurier","Alexander Mackenzie","John A. Macdonald","Robert Borden"], correct:2 },
  { question:"Jawaharlal Nehru was the first Prime Minister of which country?", choices:["Pakistan","Bangladesh","India","Sri Lanka"], correct:2 },
  { question:"David Ben-Gurion was the first PM of which nation?", choices:["Jordan","Egypt","Israel","Lebanon"], correct:2 },
  { question:"Which Australian PM disappeared while swimming in 1967?", choices:["Robert Menzies","Harold Holt","Gough Whitlam","John Gorton"], correct:1 },
  { question:"Which UK PM introduced the welfare state and NHS after WWII?", choices:["Winston Churchill","Clement Attlee","Herbert Asquith","David Lloyd George"], correct:1 },
  { question:"Which New Zealand PM became the country's youngest-ever PM at age 37?", choices:["Helen Clark","Jenny Shipley","Jacinda Ardern","Jim Bolger"], correct:2 },
  { question:"Narendra Modi became PM of India in which year?", choices:["2010","2012","2014","2016"], correct:2 },
  { question:"Which UK PM led Britain through the Falklands War in 1982?", choices:["James Callaghan","Edward Heath","Margaret Thatcher","John Major"], correct:2 },
  { question:"Boris Johnson succeeded which PM in 2019?", choices:["David Cameron","Gordon Brown","Theresa May","Tony Blair"], correct:2 },
  { question:"Who was Australia's first female Prime Minister?", choices:["Julia Gillard","Julie Bishop","Penny Wong","Anna Bligh"], correct:0 },
  { question:"Pierre Trudeau and Justin Trudeau are both PMs of?", choices:["Australia","Canada","New Zealand","UK"], correct:1 },
  { question:"Which German Chancellor is sometimes called PM-equivalent and served 1998-2005?", choices:["Helmut Kohl","Gerhard Schröder","Helmut Schmidt","Angela Merkel"], correct:1 },
  { question:"Which UK PM presided over Brexit negotiations and then resigned?", choices:["Boris Johnson","Theresa May","David Cameron","Liz Truss"], correct:1 },
  { question:"Liz Truss holds the record for the shortest UK PM tenure — how long?", choices:["23 days","45 days","3 months","6 months"], correct:1 },
  { question:"Who was the first Labour Party Prime Minister of the UK?", choices:["Ramsay MacDonald","Clement Attlee","Tony Blair","Harold Wilson"], correct:0 },
  { question:"Which Japanese PM was assassinated in 2022?", choices:["Yoshihide Suga","Fumio Kishida","Shinzo Abe","Taro Aso"], correct:2 },
  { question:"Which Israeli PM won the Nobel Peace Prize with Yasser Arafat?", choices:["Golda Meir","Menachem Begin","Yitzhak Rabin","Shimon Peres"], correct:2 },
  { question:"Which Swedish PM was assassinated in 1986?", choices:["Tage Erlander","Palme Gunnar","Olof Palme","Carl Bildt"], correct:2 },
  { question:"Which UK PM introduced the poll tax that led to riots in 1990?", choices:["John Major","Gordon Brown","Margaret Thatcher","James Callaghan"], correct:2 },
  { question:"Robert Menzies was the longest-serving PM of which country?", choices:["New Zealand","Canada","South Africa","Australia"], correct:3 },
  { question:"Which Indian PM was assassinated in 1984?", choices:["Jawaharlal Nehru","Lal Bahadur Shastri","Indira Gandhi","Rajiv Gandhi"], correct:2 },
  { question:"Silvio Berlusconi served multiple terms as PM of which country?", choices:["Spain","Portugal","Italy","Greece"], correct:2 },
  { question:"Which UK PM created the National Health Service?", choices:["Winston Churchill","Clement Attlee","Harold Wilson","Aneurin Bevan"], correct:1 },
  { question:"Which PM led South Africa post-apartheid as ANC leader?", choices:["F.W. de Klerk","Nelson Mandela (President, not PM)","Thabo Mbeki","Cyril Ramaphosa"], correct:1 },
  { question:"Harold Wilson famously said a week is a long time in?", choices:["Government","War","Business","Politics"], correct:3 },
];

function shuffle<T>(arr:T[], rng:()=>number):T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];} return a; }

export function initialState(seed:number, settings:PMSettings):PMState {
  const rng=mulberry32(seed);
  const count=parseInt(settings.questions,10);
  let pool=shuffle([...ALL_Q],rng).slice(0,Math.min(count,ALL_Q.length));
  const questions=pool.map(q=>{
    const idx=q.choices.map((c,i)=>({c,i}));
    const sh=shuffle(idx,rng);
    const newCorrect=sh.findIndex(x=>x.i===q.correct) as 0|1|2|3;
    return {...q,choices:sh.map(x=>x.c) as [string,string,string,string],correct:newCorrect};
  });
  return {questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}

export function reducer(state:PMState, action:PMAction):PMState {
  if(state.phase==="done") return state;
  switch(action.type){
    case"select": if(state.submitted) return state; return {...state,selected:action.choice};
    case"submit":{ if(state.submitted||state.selected===null) return state; const q=state.questions[state.currentIndex]!; const ok=state.selected===q.correct; const pts=ok?100+Math.floor(state.timeLeft*10):0; return {...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"}; }
    case"tick":{ if(state.submitted) return state; const t=state.timeLeft-1; if(t<=0) return {...state,timeLeft:0,submitted:true,phase:"result"}; return {...state,timeLeft:t}; }
    case"next":{ const next=state.currentIndex+1; if(next>=state.questions.length) return {...state,phase:"done"}; return {...state,currentIndex:next,selected:null,submitted:false,timeLeft:15,phase:"playing"}; }
    default: return state;
  }
}

export function isTerminal(state:PMState):{score:number}|null {
  return state.phase==="done"?{score:state.score}:null;
}
