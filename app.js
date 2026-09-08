'use strict';
const $=id=>document.getElementById(id), keys=['price','delivery','quality'];
let current=null;
function node(tag,text,cls){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;}
function addQuote(q={name:'',price:'',delivery:'',quality:''}){
  if($('quotes').children.length>=50)return;
  const row=node('tr');
  for(const key of ['name',...keys]){const td=node('td'),input=node('input');input.type=key==='name'?'text':'number';input.value=q[key];input.dataset.field=key;input.required=true;
    if(key==='name'){input.maxLength=100;input.placeholder='Supplier name';}else{input.min=key==='quality'?'0':key==='price'?'0.01':'1';input.max=key==='quality'?'100':key==='price'?'1000000000000':'3650';input.step=key==='delivery'?'1':'any';input.placeholder=key==='price'?'0.00':key==='quality'?'0–100':'Days';}input.addEventListener('input',render);td.append(input);row.append(td);}
  const td=node('td'),remove=node('button','×','remove');remove.type='button';remove.addEventListener('click',()=>{row.remove();labelRows();render();});td.append(remove);row.append(td);$('quotes').append(row);labelRows();render();
}
function labelRows(){[...$('quotes').children].forEach((r,i)=>{r.querySelectorAll('input').forEach(input=>input.setAttribute('aria-label',`Supplier ${i+1} ${input.dataset.field}`));r.querySelector('button').setAttribute('aria-label',`Remove supplier ${i+1}`);});$('add').disabled=$('quotes').children.length>=50;}
for(const [i,key]of keys.entries()){const box=node('div',undefined,'weight'),label=node('label',key[0].toUpperCase()+key.slice(1));label.htmlFor='weight-'+key;const out=node('output');out.id='out-'+key;label.append(out);const input=node('input');input.type='range';input.min='0';input.max='100';input.value=[50,30,20][i];input.id='weight-'+key;input.addEventListener('input',render);box.append(label,input);$('weights').append(box);}
function read(){return [...$('quotes').children].map(r=>Object.fromEntries([...r.querySelectorAll('input')].map(input=>[input.dataset.field,input.dataset.field==='name'?input.value:input.value.trim()===''?NaN:Number(input.value)])));}
function render(){
  current=null;$('export').disabled=true;$('ranking').replaceChildren();
  const weights=Object.fromEntries(keys.map(k=>[k,Number($('weight-'+k).value)]));const total=Object.values(weights).reduce((a,b)=>a+b,0);keys.forEach(k=>$('out-'+k).textContent=total?`${(weights[k]/total*100).toFixed(0)}%`:'0%');
  try{current=SupplierScoring.evaluate(read(),weights,$('deadline').value===''?null:Number($('deadline').value));}catch(e){$('message').textContent=e.message;return;}
  const eligible=current.result.filter(q=>q.eligible), winners=eligible.filter(q=>q.rank===1);
  $('message').textContent=eligible.length?(winners.length>1?'Joint leaders: '+winners.map(q=>q.name).join(', '):eligible[0].name+' leads with your current priorities.'):'No supplier meets your delivery deadline. Review the deadline or request new quotations.';
  for(const q of current.result){const row=node('div',undefined,'result'),rank=node('div',String(q.rank).padStart(2,'0'),'rank'),identity=node('div');identity.append(node('div',q.name,'supplier-name'),node('div',`${$('currency').value} ${q.price.toLocaleString(undefined,{maximumFractionDigits:2})} · ${q.delivery} days · Quality ${q.quality}/100`,'meta'));if(!q.eligible)identity.append(node('div','Exceeds delivery deadline','late'));
    const breakdown=node('div',undefined,'breakdown'),bar=node('div',undefined,'bar');for(const key of keys){const segment=node('span',undefined,key);segment.style.width=q.parts[key]+'%';bar.append(segment);}bar.setAttribute('aria-hidden','true');breakdown.append(bar,node('div',`Price ${q.parts.price.toFixed(1)} + delivery ${q.parts.delivery.toFixed(1)} + quality ${q.parts.quality.toFixed(1)} points`,'explanation'));
    const score=node('div',q.score.toFixed(1),'score');score.append(node('small','out of 100'));row.append(rank,identity,breakdown,score);$('ranking').append(row);
  }$('export').disabled=false;
}
$('add').addEventListener('click',()=>addQuote());$('deadline').addEventListener('input',render);$('currency').addEventListener('change',render);
$('example').addEventListener('click',()=>{$('quotes').replaceChildren();[{name:'Example · Atlas Supply',price:120000,delivery:7,quality:92},{name:'Example · Bluegate Trading',price:98000,delivery:21,quality:80},{name:'Example · Cedar Industrial',price:108000,delivery:10,quality:96}].forEach(addQuote);});
$('export').addEventListener('click',()=>{if(!current)return;const url=URL.createObjectURL(new Blob([SupplierScoring.toCSV(current,$('currency').value)],{type:'text/csv;charset=utf-8'}));const a=node('a');a.href=url;a.download='supplier-comparison.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);});
addQuote();addQuote();
if(document.modelContext?.registerTool){try{Promise.resolve(document.modelContext.registerTool({name:'read_supplier_ranking',title:'Read supplier ranking',description:'Read the current quotation comparison and scoring weights without changing data.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:true},execute(input){if(!input||Object.keys(input).length)throw new Error('Expected an empty object.');if(!current)throw new Error($('message').textContent);return JSON.parse(JSON.stringify(current));}})).catch(()=>{});}catch{}}
