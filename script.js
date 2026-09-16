const money = n => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2}).format(n);
const num = id => parseFloat(document.getElementById(id).value);
const valid = (...values) => values.every(v => Number.isFinite(v) && v >= 0);
function show(id, html){const el=document.getElementById(id);el.innerHTML=html;el.classList.remove("hidden")}
function error(id,msg){show(id,`<strong>Check your input</strong><p>${msg}</p>`)}
function positiveInputs(values){return values.every(v=>Number.isFinite(v)&&v>0)}

document.querySelectorAll(".tab").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".tab").forEach(b=>b.classList.remove("active"));
    document.querySelectorAll(".panel").forEach(p=>p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.target).classList.add("active");
  });
});

function calculateFV(){
  const P=num("fvP"), r=num("fvR")/100, t=num("fvT");
  if(!positiveInputs([P,t]) || !Number.isFinite(r) || r<0) return error("fvResult","Enter a principal and time greater than 0. Rate cannot be negative.");
  const fv=P*Math.pow(1+r,t);
  show("fvResult",`<strong>Future Value: ${money(fv)}</strong><p>Interest earned: ${money(fv-P)}</p>`);
}
function calculatePV(){
  const FV=num("pvFV"), r=num("pvR")/100, t=num("pvT");
  if(!positiveInputs([FV,t]) || !Number.isFinite(r) || r<0) return error("pvResult","Enter a future value and time greater than 0. Discount rate cannot be negative.");
  const pv=FV/Math.pow(1+r,t);
  show("pvResult",`<strong>Present Value: ${money(pv)}</strong><p>Discounted amount: ${money(FV-pv)}</p>`);
}
function calculateSI(){
  const P=num("siP"), R=num("siR"), T=num("siT");
  if(!positiveInputs([P,T]) || !Number.isFinite(R)||R<0) return error("siResult","Enter principal and time greater than 0. Rate cannot be negative.");
  const si=P*R*T/100, maturity=P+si;
  show("siResult",`<div class="metric-grid"><div class="metric"><span>Interest Earned</span><b>${money(si)}</b></div><div class="metric"><span>Maturity Value</span><b>${money(maturity)}</b></div></div>`);
}
function calculateCI(){
  const P=num("ciP"), R=num("ciR"), T=num("ciT"), m=num("ciM");
  if(!positiveInputs([P,T]) || !Number.isFinite(R)||R<0) return error("ciResult","Enter principal and time greater than 0. Rate cannot be negative.");
  const A=P*Math.pow(1+(R/100)/m,m*T), ci=A-P;
  show("ciResult",`<div class="metric-grid"><div class="metric"><span>Compound Interest</span><b>${money(ci)}</b></div><div class="metric"><span>Maturity Value</span><b>${money(A)}</b></div></div>`);
}
function emiValue(P,R,T){
  const n=Math.round(T*12), r=R/100/12;
  if(r===0) return {emi:P/n,n};
  const f=Math.pow(1+r,n);
  return {emi:P*r*f/(f-1),n};
}
function calculateEMI(){
  const P=num("emiP"), R=num("emiR"), T=num("emiT");
  if(!positiveInputs([P,T]) || !Number.isFinite(R)||R<0) return error("emiResult","Enter loan amount and tenure greater than 0. Rate cannot be negative.");
  const {emi,n}=emiValue(P,R,T), total=emi*n;
  show("emiResult",`<div class="metric-grid"><div class="metric"><span>Monthly EMI</span><b>${money(emi)}</b></div><div class="metric"><span>Total Payment</span><b>${money(total)}</b></div><div class="metric"><span>Total Interest Payable</span><b>${money(total-P)}</b></div><div class="metric"><span>Number of Months</span><b>${n}</b></div></div>`);
}
function calculateAmortization(){
  const P=num("amP"), R=num("amR"), T=num("amT");
  if(!positiveInputs([P,T]) || !Number.isFinite(R)||R<0) return error("amortSummary","Enter loan amount and tenure greater than 0. Rate cannot be negative.");
  const {emi,n}=emiValue(P,R,T), mr=R/100/12;
  let balance=P, rows="", totalInterest=0;
  for(let month=1;month<=n;month++){
    const opening=balance;
    let interest=opening*mr;
    let principal=emi-interest;
    let payment=emi;
    let closing=opening-principal;
    if(month===n || closing<0.01){principal=opening;payment=principal+interest;closing=0}
    totalInterest+=interest;
    rows+=`<tr><td>${month}</td><td>${money(opening)}</td><td>${money(interest)}</td><td>${money(principal)}</td><td>${money(payment)}</td><td>${money(Math.max(0,closing))}</td></tr>`;
    balance=Math.max(0,closing);
    if(balance===0) break;
  }
  show("amortSummary",`<div class="metric-grid"><div class="metric"><span>Monthly EMI</span><b>${money(emi)}</b></div><div class="metric"><span>Total Interest</span><b>${money(totalInterest)}</b></div><div class="metric"><span>Total Payment</span><b>${money(P+totalInterest)}</b></div><div class="metric"><span>Schedule Length</span><b>${n} months</b></div></div>`);
  document.getElementById("amortBody").innerHTML=rows;
  document.getElementById("tableWrap").classList.remove("hidden");
}
function calculateScenario(){
  const P=num("scP"), T=num("scT");
  if(!positiveInputs([P,T])) return error("scenarioResult","Enter principal and time period greater than 0.");
  const rates=[8,10,12,15];
  let rows=rates.map(R=>{
    const fv=P*Math.pow(1+R/100,T);
    return `<tr><td class="rate">${R}%</td><td>${money(fv)}</td><td>${money(fv-P)}</td></tr>`;
  }).join("");
  show("scenarioResult",`<table class="scenario-table"><thead><tr><th>Interest Rate</th><th>Future Value</th><th>Interest Earned</th></tr></thead><tbody>${rows}</tbody></table>`);
}
