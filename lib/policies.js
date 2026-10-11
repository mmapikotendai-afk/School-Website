// Public policy records are intentionally separate from portal data. A future
// CMS adapter can replace this array while preserving the public schema below.
export const policyCategories = [
  { id: 'student-conduct', title: 'Student Conduct', description: 'Discipline, behaviour, school rules, and uniform regulations.', icon: 'Scale' },
  { id: 'academic-policies', title: 'Academic Policies', description: 'Assessments, examinations, academic integrity, and student promotion.', icon: 'BookOpenCheck' },
  { id: 'boarding-policies', title: 'Boarding Policies', description: 'Hostel regulations, visiting procedures, and student leave.', icon: 'BedDouble' },
  { id: 'safety-welfare', title: 'Safety & Welfare', description: 'Child safeguarding, anti-bullying, health, and student wellbeing.', icon: 'ShieldCheck' },
  { id: 'admissions', title: 'Admissions', description: 'Enrolment, attendance, transfers, and withdrawal procedures.', icon: 'ClipboardCheck' },
  { id: 'privacy-data', title: 'Privacy & Data', description: 'Personal information, student records, and data protection.', icon: 'LockKeyhole' },
];

// Policy schema:
// { id, slug, title, description, category, keywords: string[], publishedAt,
//   updatedAt, pdfUrl, fileName, status: 'draft'|'published', approved: boolean }
// Dates use YYYY-MM-DD and pdfUrl points to a school-approved PDF. Drafts may
// live in the CMS, but only complete, approved and published records are public.
export const policies = [];

export const publishedPolicies = policies.filter(policy =>
  policy.status === 'published' &&
  policy.approved === true &&
  policy.slug && policy.title && policy.description && policy.category &&
  policy.publishedAt && policy.updatedAt && policy.pdfUrl
);

export function getPolicy(slug) {
  return publishedPolicies.find(policy => policy.slug === slug);
}

export function getPolicyCategory(id) {
  return policyCategories.find(category => category.id === id);
}
