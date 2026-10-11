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
// { id, slug, title, description, category, keywords: string[], sections,
//   publishedAt, updatedAt, pdfUrl, fileName, status, approved, publicDraft }
// Dates use YYYY-MM-DD. A publicDraft is visibly labelled and is never treated
// as approved. Replace draft wording with an authenticated school document
// before changing a record to published/approved.
export const policies = [
  {
    id: 'draft-conduct', slug: 'student-code-of-conduct', title: 'Student Code of Conduct',
    description: 'General expectations for respectful behaviour, responsibility and care for the school community.',
    category: 'student-conduct', keywords: ['behaviour', 'discipline', 'respect', 'property', 'classroom', 'recess'],
    status: 'draft', approved: false, publicDraft: true,
    pdfUrl: '/policies/draft-student-code-of-conduct.pdf', fileName: 'draft-student-code-of-conduct.pdf',
    sections: [
      { title: 'Purpose', paragraphs: ['Discipline is an educative process intended to develop self-discipline, responsibility and good character. Students are expected to contribute to a safe, respectful and productive school community.'] },
      { title: 'General conduct', points: ['Be polite, well behaved and considerate towards others.', 'Respect school leaders, teachers, support staff, visitors and fellow students.', 'Care for school buildings, equipment and other property.', 'Report serious misconduct or safety concerns to a member of staff.', 'Represent the school responsibly during school activities and when wearing school uniform.'] },
      { title: 'Conduct during the school day', points: ['Attend assemblies and school activities punctually and behave respectfully.', 'Move around the school in an orderly manner and follow staff instructions.', 'Keep classrooms and shared spaces clean and ready for use.', 'Keep noise at a considerate level and avoid disrupting learning.', 'Seek permission before leaving a lesson or supervised activity.'] },
      { title: 'Responding to misconduct', points: ['Staff will address minor misconduct through appropriate guidance and corrective action.', 'Serious or repeated misconduct may be referred to school leadership and discussed with parents or guardians.', 'Any consequence should reflect the seriousness and circumstances of the conduct and follow an approved school process.'] },
    ],
  },
  {
    id: 'draft-uniform', slug: 'uniform-and-personal-appearance', title: 'Uniform & Personal Appearance',
    description: 'General guidance on wearing the school uniform neatly and maintaining an appropriate appearance.',
    category: 'student-conduct', keywords: ['uniform', 'appearance', 'hair', 'shoes', 'jewellery', 'grooming'],
    status: 'draft', approved: false, publicDraft: true,
    pdfUrl: '/policies/draft-uniform-and-personal-appearance.pdf', fileName: 'draft-uniform-and-personal-appearance.pdf',
    sections: [
      { title: 'School uniform', points: ['Wear the prescribed school uniform neatly and without unauthorised alterations.', 'Wear the correct uniform for lessons, physical education, ceremonies and other specified activities.', 'Keep uniform items clean and in good condition.', 'Wear the school badge and tie when the school requires them.', 'Wear suitable, safe footwear and approved warm clothing.'] },
      { title: 'Hair and grooming', points: ['Keep hair clean, neat and suitable for school.', 'Long hair should be secured where needed for safety and neatness.', 'Avoid styles, colours or accessories that distract from learning or create a safety concern.', 'Keep fingernails clean and suitable for school activities.'] },
      { title: 'Accessories and personal items', points: ['Jewellery and accessories should be limited to items permitted by the school.', 'Do not bring expensive or unnecessary personal items to school.', 'Students remain responsible for securing their belongings.', 'Religious or medical accommodations should be discussed respectfully with school leadership.'] },
    ],
  },
  {
    id: 'draft-attendance', slug: 'attendance-punctuality-and-leave', title: 'Attendance, Punctuality & Leave',
    description: 'General procedures for regular attendance, arriving on time and obtaining permission to leave school.',
    category: 'admissions', keywords: ['attendance', 'absence', 'late', 'punctuality', 'leave', 'withdrawal'],
    status: 'draft', approved: false, publicDraft: true,
    pdfUrl: '/policies/draft-attendance-punctuality-and-leave.pdf', fileName: 'draft-attendance-punctuality-and-leave.pdf',
    sections: [
      { title: 'Attendance', points: ['Attend all scheduled lessons, assemblies and required school activities.', 'A parent or guardian should notify the school when a student cannot attend.', 'Provide a valid explanation or supporting documentation for an absence when requested.', 'The school may contact parents or guardians where attendance is irregular or unexplained.'] },
      { title: 'Punctuality', points: ['Arrive before the start of the school day and report to lessons on time.', 'Students who arrive late should report to the designated staff member before joining class.', 'Repeated lateness may lead to a meeting with the student and parent or guardian.'] },
      { title: 'Leaving the school grounds', points: ['Students must obtain permission before leaving the school during the school day.', 'A student who becomes unwell should inform a teacher or designated staff member.', 'Parents or guardians may be asked to collect a student who needs to go home.', 'Leaving without permission may be handled as a disciplinary matter.'] },
    ],
  },
  {
    id: 'draft-academic-devices', slug: 'classroom-and-digital-device-guidelines', title: 'Classroom & Digital Device Guidelines',
    description: 'General expectations that protect learning time and encourage responsible use of digital devices.',
    category: 'academic-policies', keywords: ['classroom', 'mobile phone', 'device', 'technology', 'learning', 'recording'],
    status: 'draft', approved: false, publicDraft: true,
    pdfUrl: '/policies/draft-classroom-and-digital-device-guidelines.pdf', fileName: 'draft-classroom-and-digital-device-guidelines.pdf',
    sections: [
      { title: 'Readiness for learning', points: ['Arrive prepared with the materials required for each lesson.', 'Follow the teacher’s instructions and allow others to learn without disruption.', 'Complete assigned learning activities honestly and responsibly.', 'Leave classrooms clean and switch off equipment when instructed.'] },
      { title: 'Mobile and electronic devices', points: ['Use mobile phones and electronic devices only at times and in places authorised by the school.', 'Keep devices switched off or stored securely during lessons unless a teacher permits their use.', 'Do not photograph, film or record another person without permission.', 'The school may restrict a device that disrupts learning or is used inappropriately.'] },
      { title: 'Learning devices', points: ['Use school-approved learning devices for educational work.', 'Follow teacher instructions about when and how a device may be used.', 'Protect accounts, passwords and personal information.', 'Do not use learning time for games, entertainment or unrelated online activity.'] },
    ],
  },
  {
    id: 'draft-safety', slug: 'student-safety-and-prohibited-items', title: 'Student Safety & Prohibited Items',
    description: 'General precautions for safe activities, reporting concerns and keeping harmful items away from school.',
    category: 'safety-welfare', keywords: ['safety', 'injury', 'weapons', 'prohibited', 'wellbeing', 'bullying'],
    status: 'draft', approved: false, publicDraft: true,
    pdfUrl: '/policies/draft-student-safety-and-prohibited-items.pdf', fileName: 'draft-student-safety-and-prohibited-items.pdf',
    sections: [
      { title: 'Safe participation', points: ['Participate responsibly in sport, recreation and other school activities.', 'Use only approved areas and equipment and follow staff supervision.', 'Report injuries, hazards, bullying or threats promptly to a member of staff.', 'Seek help immediately when another person may be at risk.'] },
      { title: 'Prohibited items', points: ['Do not bring weapons, weapon-like objects or items intended to harm another person onto school grounds.', 'Do not bring illegal substances or items that pose a health or safety risk.', 'Do not bring gambling materials or other items specifically prohibited by the school.', 'Give any dangerous item found on school grounds to a member of staff without handling it unnecessarily.'] },
      { title: 'Personal safety and belongings', points: ['Keep money, devices and other valuables secure.', 'Avoid bringing valuable items that are not required for school.', 'Follow the school’s procedures for lost property.', 'Report suspicious persons or unsafe conduct to staff.'] },
    ],
  },
];

export const publishedPolicies = policies.filter(policy =>
  policy.status === 'published' &&
  policy.approved === true &&
  policy.slug && policy.title && policy.description && policy.category &&
  policy.publishedAt && policy.updatedAt && policy.pdfUrl
);

export const publicPolicies = policies.filter(policy =>
  (policy.status === 'published' && policy.approved === true && policy.publishedAt && policy.updatedAt) ||
  (policy.status === 'draft' && policy.approved === false && policy.publicDraft === true)
).filter(policy => policy.slug && policy.title && policy.description && policy.category && policy.pdfUrl && policy.sections?.length);

export function getPolicy(slug) {
  return publicPolicies.find(policy => policy.slug === slug);
}

export function getPolicyCategory(id) {
  return policyCategories.find(category => category.id === id);
}
