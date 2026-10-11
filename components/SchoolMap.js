'use client';

import dynamic from 'next/dynamic';

const SchoolMapClient = dynamic(() => import('./SchoolMapClient'), {
  ssr: false,
  loading: () => <div className="school-map-loading" role="status">Loading the school map…</div>,
});

export default function SchoolMap() {
  return <SchoolMapClient />;
}
