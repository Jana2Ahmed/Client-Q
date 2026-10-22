(function(root){
const normalize=s=>String(s||'').normalize('NFKC').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/[\u064B-\u065Fـ]/g,'').replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ').trim().toLowerCase();
const display=v=>Array.isArray(v)?v.join('، '):String(v??'');
function generate(data,scope='all'){
 const rows=[];const add=(id,product_id,question,answer,source,topic='usage')=>{const count=data.evidence.filter(e=>(product_id?e.product_id===product_id:true)&&(e.topic===topic||(topic==='specification'&&e.topic==='product_info'))).reduce((n,e)=>n+e.count,0);rows.push({id,product_id,question,answer,source,count,status:'draft',merchant:false,category:product_id?'المنتجات':topic==='shipping'?'الشحن والتوصيل':'سياسات المتجر'});};
 if(scope==='all'||scope==='store'){
 data.faqs.filter(f=>!f.product_id).forEach(f=>add(f.id,null,f.question,f.answer,'الأسئلة الموثقة · faqs / '+f.id,/شحن|يصل/.test(f.question)?'shipping':'return'));
 add('store-payment',null,'ما طرق الدفع المتاحة؟',data.store.payment_methods.map(x=>({mada:'مدى',visa:'فيزا',apple_pay:'Apple Pay'}[x]||x)).join('، ')+'؛ الدفع عند الاستلام غير متاح.','بيانات المتجر · payment_methods','payment');
 }
 if(scope==='store')return rows;
 for(const p of data.products.filter(p=>scope==='all'||p.id===scope)){
 for(const [key,q,topic] of [['usage_instructions','كيف أستخدم هذا المنتج؟','usage'],['care_instructions','كيف أحافظ على المنتج وأنظفه؟','usage'],['included_items','ما محتويات العبوة؟','included']])if(p[key]?.length)add(p.id+'-'+key,p.id,q,p[key].join(' '),'بيانات المنتج · '+p.id+' / '+key,topic);
 if(p.not_included?.length)add(p.id+'-excluded',p.id,'ما الأشياء غير المشمولة مع المنتج؟',p.not_included.join('، '),'بيانات المنتج · not_included','included');
 for(const s of p.specifications||[])if(s.value!==null&&s.value!==undefined&&s.value!=='')add(p.id+'-spec-'+s.key,p.id,typeof s.value==='boolean'?'هل '+s.label_ar+' متوفر مع المنتج؟':'ما '+s.label_ar+'؟',typeof s.value==='boolean'?(s.value?'نعم، '+s.label_ar+' متوفر مع المنتج.':'لا، '+s.label_ar+' غير مشمول مع المنتج.'):display(s.value),'مواصفات المنتج · '+p.id+' / '+s.key,'specification');
 for(const field of [...new Set([...(p.unknown_fields||[]),...(p.content_gaps||[])])])add(p.id+'-gap-'+normalize(display(field)),p.id,'معلومة تحتاج توضيحًا: '+display(field),'','معلومات غير موثقة · '+p.id+' / content_gaps','gap');
 }
 return rows;
}
function merge(existing,incoming){const ids=new Set(existing.map(x=>x.id));return [...existing,...incoming.filter(x=>!ids.has(x.id))];}
function approve(row){if(!row.answer?.trim())throw Error('أكمل الإجابة أولًا قبل اعتمادها.');return {...row,status:'approved'};}
const api={normalize,generate,merge,approve};root.FAQEngine=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
