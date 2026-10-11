import assert from 'node:assert/strict';
import { school, news, events, gallery } from '../lib/content.js';
import { policies, policyCategories, publicPolicies, publishedPolicies } from '../lib/policies.js';
assert.equal(new URL(school.portalUrl).protocol, 'https:');
assert.deepEqual(school.coordinates, [-18.2733326, 30.6652775]);
assert.equal(new URL(school.directionsUrl).hostname, 'www.openstreetmap.org');
assert.ok(school.physicalAddress && school.address, 'Map popup requires physical and postal addresses');
const slugs = new Set();
for (const article of news) {
  assert.ok(article.id && article.slug && /^[a-z0-9-]+$/.test(article.slug), 'News needs a safe slug and ID');
  assert.ok(!slugs.has(article.slug), 'Duplicate news slug'); slugs.add(article.slug);
  if(article.status === 'published') {
    assert.equal(article.approved, true, 'Published stories need approval');
    assert.ok(article.title && article.excerpt && article.author && article.body?.length);
    assert.ok(!Number.isNaN(Date.parse(article.date)), 'News needs a valid date');
  }
}
for(const event of events.filter(e=>e.status==='published')) {assert.equal(event.approved,true);assert.ok(event.title && event.venue && event.description && !Number.isNaN(Date.parse(event.date)));}
for(const photo of gallery) {assert.ok(photo.alt && photo.caption && photo.category);assert.ok(photo.src.startsWith('/images/'));}
assert.equal(new Set(policyCategories.map(category => category.id)).size, policyCategories.length, 'Policy category IDs must be unique');
const policySlugs = new Set();
for (const policy of policies) {
  assert.ok(policy.id && policy.slug && /^[a-z0-9-]+$/.test(policy.slug), 'Policies need a safe slug and ID');
  assert.ok(!policySlugs.has(policy.slug), 'Duplicate policy slug'); policySlugs.add(policy.slug);
  assert.ok(policyCategories.some(category => category.id === policy.category), 'Policy needs a known category');
  if (policy.status === 'published') {
    assert.equal(policy.approved, true, 'Published policies need school approval');
    assert.ok(policy.title && policy.description && policy.pdfUrl, 'Published policies need public copy and a PDF');
    assert.ok(policy.pdfUrl.startsWith('/policies/') && policy.pdfUrl.toLowerCase().endsWith('.pdf'), 'Published policy PDFs belong in /public/policies');
    assert.ok(!Number.isNaN(Date.parse(policy.publishedAt)) && !Number.isNaN(Date.parse(policy.updatedAt)), 'Published policies need valid dates');
  }
  if (policy.publicDraft) {
    assert.equal(policy.status, 'draft', 'A public draft must retain draft status');
    assert.equal(policy.approved, false, 'A public draft must not be represented as approved');
    assert.ok(policy.sections?.length && policy.pdfUrl.startsWith('/policies/'), 'A public draft needs readable sections and a review PDF');
  }
}
assert.deepEqual(publishedPolicies, policies.filter(policy => policy.status === 'published' && policy.approved === true && policy.slug && policy.title && policy.description && policy.category && policy.publishedAt && policy.updatedAt && policy.pdfUrl));
assert.ok(publicPolicies.every(policy => policy.status === 'published' || policy.publicDraft === true), 'Public policy selection contains an invalid record');
console.log('Public content checks passed. No private records or unapproved published content configured.');
