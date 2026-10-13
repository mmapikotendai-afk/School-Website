export const A_LEVEL_PATHWAYS = [
  { id: 'sciences', name: 'Sciences', subjects: ['Geography', 'Mathematics', 'Chemistry', 'Physics', 'Computer Science', 'Biology'] },
  { id: 'arts', name: 'Arts', subjects: ['Heritage', 'Shona', 'Literature in English', 'History'] },
  { id: 'commercials', name: 'Commercials', subjects: ['Accounting', 'Business Studies', 'Economics'] },
];

export const DEFAULT_A_LEVEL_REQUIREMENTS = {
  internal_attendance_requirement: 'Must have attended Presbyterian High School from Form 1 through Form 4.',
  internal_minimum_a_grades: 5,
  external_minimum_a_grades: 7,
};

export const A_LEVEL_SUBJECTS = Object.fromEntries(A_LEVEL_PATHWAYS.map(pathway => [pathway.id, pathway.subjects]));

