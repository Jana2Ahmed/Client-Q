const assert = require('node:assert/strict');
const engine = require('../dist/faq.js');
const data = {
  faqs: [{ id: 'faq_1', question: 'متى يصل الطلب؟', answer: 'خلال أيام العمل.' }],
  store: { payment_methods: ['مدى', 'فيزا'] },
  evidence: [{ product_id: 'prd_1', topic: 'usage', count: 3 }],
  products: [{ id: 'prd_1', name: 'قهوة تجريبية', unknown_fields: ['مدة الحفظ غير موثقة'], content_gaps: [], usage_instructions: ['تُحفظ بعيدًا عن الرطوبة.'], included_items: ['عبوة قهوة'], specifications: [{ key: 'weight', label_ar: 'الوزن', value: '250 جم' }] }]
};
assert.equal(engine.normalize('إثيوبيّ، مُحمّص'), 'اثيوبي محمص');
const generated = engine.generate(data);
assert(generated.some(q => q.id === 'faq_1'));
assert(generated.some(q => q.answer.includes('مدى')));
assert(generated.some(q => q.source.includes('usage_instructions') && q.count === 3));
const gap = generated.find(q => q.id.includes('-gap-'));
assert(gap && gap.answer === '', 'Unknown product facts must stay unanswered');
assert.throws(() => engine.approve(gap), /أكمل الإجابة/);
assert.equal(engine.approve(generated.find(q=>q.answer.trim())).status, 'approved');
const merged = engine.merge(generated, generated);
assert.equal(merged.length, generated.length, 'Regeneration must not duplicate IDs');
const edited = {...generated[0], answer:'إجابة التاجر', status:'approved', merchant:true};
const again = engine.merge([edited], generated);
assert.equal(again[0].answer, 'إجابة التاجر', 'Regeneration must retain merchant edits');
console.log(`FAQ logic checks passed (${generated.length} source suggestions).`);
