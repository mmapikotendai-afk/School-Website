'use client';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteContentAction, deleteMediaAction } from '@/lib/cms/actions';

export default function DeleteButton({ id, type, label }) {
  const [confirming, setConfirming] = useState(false);
  const action = type === 'media' ? deleteMediaAction : deleteContentAction;
  if (!confirming) {
    const className = type === 'media' ? 'admin-icon-button danger' : 'admin-delete-button';
    return <button type="button" className={className} aria-label={`Delete ${label}`} onClick={() => setConfirming(true)}><Trash2 size={17} aria-hidden="true"/>{type !== 'media' && <span>Delete</span>}</button>;
  }
  return <form action={action} className="delete-confirm" aria-label={`Confirm deletion of ${label}`}><input type="hidden" name="id" value={id}/>{type !== 'media' && <input type="hidden" name="type" value={type}/>}<span>Delete permanently?</span><button type="submit" className="delete-confirm-action">Confirm delete</button><button type="button" onClick={() => setConfirming(false)}>Cancel</button></form>;
}
