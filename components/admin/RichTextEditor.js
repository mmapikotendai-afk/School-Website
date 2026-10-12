'use client';
import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Heading2, Italic, Link as LinkIcon, List, ListOrdered, Quote, Redo2, Undo2 } from 'lucide-react';

export default function RichTextEditor({ name, value, label }) {
  const [json, setJson] = useState(value || { type: 'doc', content: [{ type: 'paragraph' }] });
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit.configure({ heading: { levels: [2,3,4] } }), Link.configure({ openOnClick: false }), Placeholder.configure({ placeholder: 'Write clear, approved content…' })],
    content: value || { type: 'doc', content: [{ type: 'paragraph' }] },
    onUpdate: ({ editor: current }) => setJson(current.getJSON()),
  });
  const setLink = () => {
    const previous = editor.getAttributes('link').href || '';
    const href = window.prompt('Link address (https://…)', previous);
    if (href === null) return;
    if (!href) editor.chain().focus().extendMarkRange('link').unsetLink().run();
    else editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
  };
  if (!editor) return <label>{label}<textarea name={name} hidden defaultValue={JSON.stringify(value || {})}/></label>;
  const button = (title, icon, active, onClick, disabled = false) => <button key={title} type="button" title={title} aria-label={title} aria-pressed={active || undefined} onClick={onClick} disabled={disabled}>{icon}</button>;
  return <div className="editor-field"><span className="editor-label">{label}</span><div className="editor-toolbar" role="toolbar" aria-label={`${label} formatting`}>
    {button('Bold', <Bold size={17}/>, editor.isActive('bold'), () => editor.chain().focus().toggleBold().run())}
    {button('Italic', <Italic size={17}/>, editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run())}
    {button('Heading', <Heading2 size={17}/>, editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run())}
    {button('Bullet list', <List size={17}/>, editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run())}
    {button('Numbered list', <ListOrdered size={17}/>, editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run())}
    {button('Block quote', <Quote size={17}/>, editor.isActive('blockquote'), () => editor.chain().focus().toggleBlockquote().run())}
    {button('Link', <LinkIcon size={17}/>, editor.isActive('link'), setLink)}
    <span className="editor-toolbar-spacer"/>
    {button('Undo', <Undo2 size={17}/>, false, () => editor.chain().focus().undo().run(), !editor.can().undo())}
    {button('Redo', <Redo2 size={17}/>, false, () => editor.chain().focus().redo().run(), !editor.can().redo())}
  </div><EditorContent editor={editor}/><input type="hidden" name={name} value={JSON.stringify(json)} readOnly /></div>;
}
