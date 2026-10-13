import { ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';
import { A_LEVEL_PATHWAYS } from '@/lib/academics';

export function ALevelPathways({ combinations = [], compact = false }) {
  return <div className={`a-level-offering${compact ? ' a-level-offering-compact' : ''}`}>
    <div className="a-level-heading">
      <h3>Choose the subjects that fit your direction.</h3>
      <p>Available A-Level subjects are organised into Sciences, Arts and Commercials. Official combinations are published separately once approved.</p>
    </div>
    <div className="pathway-list">
      {A_LEVEL_PATHWAYS.map(pathway => <article key={pathway.id}>
        <h4>{pathway.name}</h4>
        <ul>{pathway.subjects.map(subject => <li key={subject}><Check size={15} aria-hidden="true"/>{subject}</li>)}</ul>
      </article>)}
    </div>
    {!compact && <ApprovedCombinations combinations={combinations}/>} 
  </div>;
}

export function ApprovedCombinations({ combinations = [], showPlaces = false }) {
  return <section className="approved-combinations" aria-labelledby={showPlaces ? 'available-places-title' : 'approved-combinations-title'}>
    <div>
      <h3 id={showPlaces ? 'available-places-title' : 'approved-combinations-title'}>{showPlaces ? 'Available places' : 'Approved subject combinations'}</h3>
      <p>{showPlaces ? 'Capacity is shown only when it has been confirmed and approved by the school.' : 'Only school-approved combinations are shown here.'}</p>
    </div>
    {combinations.length ? <div className="combination-list">{combinations.map(item => <article key={item.id}>
      <div><span>{item.pathway}</span><h4>{item.name}</h4><p>{item.subjects.join(' · ')}</p></div>
      {showPlaces && <strong>{item.available_places == null ? 'Capacity awaiting confirmation' : `${item.available_places} ${item.available_places === 1 ? 'place' : 'places'} available`}</strong>}
      {item.availability_note && <small>{item.availability_note}</small>}
    </article>)}</div> : <div className="availability-empty">
      <p>No approved combinations or capacity figures have been published yet.</p>
      <Link href="/contact/?topic=Lower%20Sixth%20admissions" className="text-link">Ask about A-Level availability <ArrowRight size={17}/></Link>
    </div>}
  </section>;
}

export function EntryRequirements({ requirements }) {
  return <div className="entry-requirements">
    <article>
      <span>Current PHS students</span>
      <h3>Internal applicants</h3>
      <p>{requirements.internal_attendance_requirement}</p>
      <strong>At least <b>{requirements.internal_minimum_a_grades} A grades</b> at O-Level</strong>
    </article>
    <article>
      <span>Students from other schools</span>
      <h3>External applicants</h3>
      <p>Applicants joining Presbyterian High School from another school.</p>
      <strong>At least <b>{requirements.external_minimum_a_grades} A grades</b> at O-Level</strong>
    </article>
  </div>;
}

