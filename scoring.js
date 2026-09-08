(function(root){
  'use strict';
  function evaluate(quotes,weights,deadline=null){
    if(!Array.isArray(quotes)||quotes.length<2||quotes.length>50)throw new Error('Enter between 2 and 50 suppliers to compare.');
    const keys=['price','delivery','quality'];
    if(!weights||keys.some(k=>!Number.isFinite(weights[k])||weights[k]<0||weights[k]>100))throw new Error('Weights must be numbers from 0 to 100.');
    const sum=keys.reduce((n,k)=>n+weights[k],0);
    if(!sum)throw new Error('Set at least one weight above zero.');
    if(deadline!==null&&(!Number.isInteger(deadline)||deadline<1||deadline>3650))throw new Error('Delivery deadline must be a whole number from 1 to 3650.');
    const names=new Set();
    quotes.forEach((q,i)=>{
      if(typeof q.name!=='string'||!q.name.trim()||q.name.trim().length>100)throw new Error(`Supplier ${i+1}: enter a name of up to 100 characters.`);
      const key=q.name.trim().toLowerCase();if(names.has(key))throw new Error('Use a different name for each supplier.');names.add(key);
      if(!Number.isFinite(q.price)||q.price<=0||q.price>1e12)throw new Error(`${q.name}: enter a price above 0 and no greater than 1 trillion.`);
      if(!Number.isInteger(q.delivery)||q.delivery<1||q.delivery>3650)throw new Error(`${q.name}: delivery must be 1–3650 whole days.`);
      if(!Number.isFinite(q.quality)||q.quality<0||q.quality>100)throw new Error(`${q.name}: enter a quality score from 0 to 100.`);
    });
    const cheapest=Math.min(...quotes.map(q=>q.price)),fastest=Math.min(...quotes.map(q=>q.delivery));
    const normalized=Object.fromEntries(keys.map(k=>[k,weights[k]/sum]));
    const result=quotes.map(q=>{const parts={price:cheapest/q.price*100*normalized.price,delivery:fastest/q.delivery*100*normalized.delivery,quality:q.quality*normalized.quality};return {...q,name:q.name.trim(),parts,score:parts.price+parts.delivery+parts.quality,eligible:deadline===null||q.delivery<=deadline};});
    result.sort((a,b)=>Number(b.eligible)-Number(a.eligible)||b.score-a.score||a.name.localeCompare(b.name));
    let rank=0,previous=null;
    result.forEach((q,i)=>{if(!previous||q.eligible!==previous.eligible||Math.abs(q.score-previous.score)>1e-9)rank=i+1;q.rank=rank;previous=q;});
    return {result,normalized,deadline};
  }
  function csvCell(value){let s=String(value);if(/^[\s]*[=+@-]/.test(s)||/^[\t\r\n]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}
  function toCSV(evaluation,currency){
    const rows=[['Rank','Supplier','Currency','Total price','Delivery days','Quality /100','Score /100','Meets deadline','Price points','Delivery points','Quality points','Price weight %','Delivery weight %','Quality weight %','Deadline days']];
    evaluation.result.forEach(q=>rows.push([q.rank,q.name,currency,q.price,q.delivery,q.quality,q.score.toFixed(4),q.eligible?'Yes':'No',q.parts.price.toFixed(4),q.parts.delivery.toFixed(4),q.parts.quality.toFixed(4),...( ['price','delivery','quality'].map(k=>(evaluation.normalized[k]*100).toFixed(4))),evaluation.deadline??'None']));
    return '\ufeff'+rows.map(row=>row.map(csvCell).join(',')).join('\r\n');
  }
  const api={evaluate,toCSV};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SupplierScoring=api;
})(typeof globalThis!=='undefined'?globalThis:this);
