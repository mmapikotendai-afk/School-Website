'use client';
import { useActionState, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { A_LEVEL_PATHWAYS } from '@/lib/academics';
import { deleteALevelCombinationAction, saveALevelCombinationAction, saveALevelSettingsAction } from '@/lib/cms/actions';

const initialState = {};

function FormMessage({ state }) {
  if (state?.error) return <p className="admin-error" role="alert">{state.error}</p>;
  if (state?.success) return <p className="admin-success" role="status">{state.success}</p>;
  return null;
}

export function RequirementsForm({ requirements }) {
  const [state, action, pending] = useActionState(saveALevelSettingsAction, initialState);
  return <form action={action} className="admin-panel academic-settings-form">
    <div className="admin-panel-head"><div><h2>Entry requirements</h2><span>Shown on the Admissions page</span></div></div>
    <div className="academic-form-body">
      <label>Internal applicant attendance requirement<textarea name="internal_attendance_requirement" rows="3" required maxLength="500" defaultValue={requirements.internal_attendance_requirement}/></label>
      <div className="admin-form-grid">
        <label>Internal minimum A grades<input name="internal_minimum_a_grades" type="number" min="0" max="20" step="1" required defaultValue={requirements.internal_minimum_a_grades}/></label>
        <label>External minimum A grades<input name="external_minimum_a_grades" type="number" min="0" max="20" step="1" required defaultValue={requirements.external_minimum_a_grades}/></label>
      </div>
      <FormMessage state={state}/>
      <button className="button button-primary" type="submit" disabled={pending}><Save size={17}/>{pending ? 'Saving…' : 'Save requirements'}</button>
    </div>
  </form>;
}

function CombinationForm({ combination, canDelete, isNew = false }) {
  const initialPathway = combination?.pathway || A_LEVEL_PATHWAYS[0].id;
  const [pathway, setPathway] = useState(initialPathway);
  const [state, action, pending] = useActionState(saveALevelCombinationAction, initialState);
  const pathwayData = A_LEVEL_PATHWAYS.find(item => item.id === pathway);
  return <form action={action} className="admin-panel combination-editor">
    {combination?.id && <input type="hidden" name="id" value={combination.id}/>} 
    <div className="admin-panel-head"><div><h2>{isNew ? 'Add approved combination' : combination.name}</h2><span>{isNew ? 'Create as a draft until school approval' : combination.published ? 'Published on the website' : 'Draft — visible only in the CMS'}</span></div></div>
    <div className="academic-form-body">
      <div className="admin-form-grid">
        <label>Combination name<input name="name" required maxLength="160" defaultValue={combination?.name || ''} placeholder="Enter the school-approved name"/></label>
        <label>Academic pathway<select name="pathway" value={pathway} onChange={event => setPathway(event.target.value)}>{A_LEVEL_PATHWAYS.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      </div>
      <fieldset className="subject-selector"><legend>Subjects in this combination</legend><p>Select only subjects approved by the school.</p><div>{pathwayData.subjects.map(subject => <label key={`${pathway}-${subject}`}><input type="checkbox" name="subjects" value={subject} defaultChecked={pathway === initialPathway && combination?.subjects?.includes(subject)}/><span>{subject}</span></label>)}</div></fieldset>
      <div className="admin-form-grid">
        <label>Available places <span className="field-help">Leave blank until capacity is officially confirmed.</span><input name="available_places" type="number" min="0" step="1" defaultValue={combination?.available_places ?? ''} placeholder="Not yet confirmed"/></label>
        <label>Display order<input name="sort_order" type="number" step="1" defaultValue={combination?.sort_order ?? 0}/></label>
      </div>
      <label>Availability note <span className="field-help">Optional. Do not enter unconfirmed deadlines or enrolment figures.</span><textarea name="availability_note" rows="2" maxLength="300" defaultValue={combination?.availability_note || ''}/></label>
      <label className="academic-publish"><input type="checkbox" name="published" defaultChecked={combination?.published || false}/><span><strong>Publish on the website</strong>Only enable this after the combination has been approved.</span></label>
      <FormMessage state={state}/>
      <div className="admin-inline-actions"><button className="button button-primary" type="submit" disabled={pending}><Save size={17}/>{pending ? 'Saving…' : isNew ? 'Add combination' : 'Save changes'}</button>{combination?.id && canDelete && <CombinationDelete id={combination.id} name={combination.name}/>}</div>
    </div>
  </form>;
}

function CombinationDelete({ id, name }) {
  const [confirming, setConfirming] = useState(false);
  if (!confirming) return <button type="button" className="admin-delete-button" onClick={() => setConfirming(true)}><Trash2 size={17}/>Delete</button>;
  return <div className="delete-confirm"><span>Delete “{name}” permanently?</span><button type="submit" formAction={deleteALevelCombinationAction} className="delete-confirm-action">Confirm delete</button><button type="button" onClick={() => setConfirming(false)}>Cancel</button></div>;
}

export default function AcademicsManager({ data, role }) {
  return <div className="academics-manager">
    <RequirementsForm requirements={data.requirements}/>
    <section className="combination-management" aria-labelledby="combination-management-title">
      <div className="combination-management-head"><div><h2 id="combination-management-title">Subject combinations and places</h2><p>No combination or capacity appears publicly until it is explicitly published.</p></div><Plus size={24} aria-hidden="true"/></div>
      <CombinationForm isNew canDelete={role === 'admin'}/>
      {data.combinations.map(combination => <CombinationForm key={combination.id} combination={combination} canDelete={role === 'admin'}/>)}
    </section>
  </div>;
}

