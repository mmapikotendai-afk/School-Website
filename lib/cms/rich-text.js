import React from 'react';

const allowedMarks = new Set(['bold', 'italic', 'link']);
function renderNode(node, key) {
  if (!node || typeof node !== 'object') return null;
  if (node.type === 'text') {
    let output = node.text || '';
    for (const mark of node.marks || []) {
      if (!allowedMarks.has(mark.type)) continue;
      if (mark.type === 'bold') output = <strong key={`${key}-b`}>{output}</strong>;
      if (mark.type === 'italic') output = <em key={`${key}-i`}>{output}</em>;
      if (mark.type === 'link') {
        const href = String(mark.attrs?.href || '');
        if (/^(https?:\/\/|mailto:|tel:)/i.test(href)) output = <a key={`${key}-a`} href={href} rel="noopener noreferrer">{output}</a>;
      }
    }
    return output;
  }
  const children = (node.content || []).map((child, index) => renderNode(child, `${key}-${index}`));
  if (node.type === 'doc') return children;
  if (node.type === 'paragraph') return <p key={key}>{children.length ? children : <br />}</p>;
  if (node.type === 'heading') {
    const level = [2, 3, 4].includes(node.attrs?.level) ? node.attrs.level : 2;
    return React.createElement(`h${level}`, { key }, children);
  }
  if (node.type === 'bulletList') return <ul key={key}>{children}</ul>;
  if (node.type === 'orderedList') return <ol key={key}>{children}</ol>;
  if (node.type === 'listItem') return <li key={key}>{children}</li>;
  if (node.type === 'blockquote') return <blockquote key={key}>{children}</blockquote>;
  if (node.type === 'hardBreak') return <br key={key} />;
  if (node.type === 'horizontalRule') return <hr key={key} />;
  return children;
}

export function RichText({ value }) {
  if (!value) return null;
  const document = typeof value === 'string' ? JSON.parse(value) : value;
  return <>{renderNode(document, 'root')}</>;
}

export function richTextPlainText(value) {
  if (!value) return '';
  const document = typeof value === 'string' ? JSON.parse(value) : value;
  const read = node => node?.type === 'text' ? node.text || '' : (node?.content || []).map(read).join(node?.type === 'paragraph' ? ' ' : '');
  return read(document).trim();
}
