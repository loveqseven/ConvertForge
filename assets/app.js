const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const escapeHtml=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
function saveBlob(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000)}
function ext(name){return (name.split('.').pop()||'').toLowerCase()}
function mime(format){return ({png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',svg:'image/svg+xml',txt:'text/plain',md:'text/markdown',html:'text/html',json:'application/json',csv:'text/csv',xml:'application/xml',pdf:'application/pdf'})[format]||'application/octet-stream'}
async function imageConvert(file,to){
  const e=ext(file.name); if(e==='svg' || file.type.startsWith('image/')){
    const url=URL.createObjectURL(file); const img=new Image();
    await new Promise((res,rej)=>{img.onload=res;img.onerror=rej;img.src=url});
    const canvas=document.createElement('canvas');canvas.width=img.naturalWidth||1200;canvas.height=img.naturalHeight||800;canvas.getContext('2d').drawImage(img,0,0);
    const type=mime(to); if(to==='svg'){const reader=new FileReader(); if(e==='svg') return file; throw new Error('Raster to SVG needs a vector tracing engine; choose PNG, JPG or WEBP.')} 
    const blob=await new Promise(r=>canvas.toBlob(r,type,to==='jpg'?0.9:undefined));URL.revokeObjectURL(url); if(!blob)throw new Error('This browser does not support that output format.'); return blob;
  } throw new Error('Please choose an image file.');
}
async function textConvert(file,to){
 const text=await file.text();
 if(to==='json'){
   try{return new Blob([JSON.stringify(JSON.parse(text),null,2)],{type:mime(to)})}catch{throw new Error('The source is not valid JSON.')}}
 if(to==='csv' && ext(file.name)==='json'){
   const data=JSON.parse(text); const rows=Array.isArray(data)?data:[data]; const keys=[...new Set(rows.flatMap(o=>Object.keys(o||{})))]; const csv=[keys,...rows.map(o=>keys.map(k=>JSON.stringify(o?.[k]??'')))].map(r=>r.join(',')).join('\n');return new Blob([csv],{type:mime(to)})
 }
 if(to==='html' && ext(file.name)==='txt') return new Blob(['<!doctype html><html><body><pre>'+escapeHtml(text)+'</pre></body></html>'],{type:mime(to)})
 if(to==='txt' && ext(file.name)==='html'){const d=new DOMParser().parseFromString(text,'text/html');return new Blob([d.body.innerText],{type:mime(to)})}
 if(to==='md' && ext(file.name)==='html'){const d=new DOMParser().parseFromString(text,'text/html');return new Blob([d.body.innerText],{type:mime(to)})}
 return new Blob([text],{type:mime(to)})
}
async function imageToPdf(file){
 if(!window.PDFLib) throw new Error('PDF engine is still loading. Please try again.');
 const bytes=new Uint8Array(await file.arrayBuffer()); const pdf=await PDFLib.PDFDocument.create(); let img;
 const type=file.type || mime(ext(file.name)); if(type==='image/png')img=await pdf.embedPng(bytes); else img=await pdf.embedJpg(bytes);
 const page=pdf.addPage([img.width,img.height]);page.drawImage(img,{x:0,y:0,width:img.width,height:img.height});return new Blob([await pdf.save()],{type:'application/pdf'});
}
function initConverter(){const card=$('.converter-card');if(!card)return;let file=null;const input=$('#file');const drop=$('.drop');const info=$('.fileinfo');const from=$('#from');const to=$('#to');const btn=$('#convert');const status=$('.status');
 const setFile=f=>{file=f;info.style.display='block';info.textContent=`Selected: ${f.name} • ${(f.size/1024/1024).toFixed(2)} MB`;status.textContent='Ready to convert.'};
 drop.addEventListener('click',()=>input.click());input.addEventListener('change',e=>e.target.files[0]&&setFile(e.target.files[0]));['dragenter','dragover'].forEach(x=>drop.addEventListener(x,e=>{e.preventDefault();drop.classList.add('drag')}));['dragleave','drop'].forEach(x=>drop.addEventListener(x,e=>{e.preventDefault();drop.classList.remove('drag')}));drop.addEventListener('drop',e=>e.dataTransfer.files[0]&&setFile(e.dataTransfer.files[0]));
 btn.addEventListener('click',async()=>{if(!file){status.textContent='Choose a file first.';return}btn.disabled=true;status.textContent='Converting…';try{const fto=to.value;let blob;const fe=ext(file.name);if(['png','jpg','jpeg','webp','svg'].includes(fe)&&['png','jpg','webp'].includes(fto))blob=await imageConvert(file,fto);else if(fto==='pdf'&&file.type.startsWith('image/'))blob=await imageToPdf(file);else if(['txt','md','html','json','csv','xml'].includes(fe)&&['txt','md','html','json','csv','xml'].includes(fto))blob=await textConvert(file,fto);else throw new Error('This conversion needs a server-side conversion engine. The page is ready for an API connection, but no fake conversion is performed.');const base=file.name.replace(/\.[^.]+$/,'');saveBlob(blob,`${base}.${fto==='jpeg'?'jpg':fto}`);status.textContent='Done — your converted file is downloading.'}catch(e){status.textContent=e.message}finally{btn.disabled=false}})}
function initSearch(){const s=$('#siteSearch');if(!s)return;s.addEventListener('input',()=>{const q=s.value.toLowerCase();$$('[data-tool]').forEach(x=>x.style.display=x.textContent.toLowerCase().includes(q)?'':'none')})}
initConverter();initSearch();
