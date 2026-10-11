import assert from 'node:assert/strict';
import { school, news, events, gallery } from '../lib/content.js';
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
console.log('Public content checks passed. No private records or unapproved published stories configured.');
