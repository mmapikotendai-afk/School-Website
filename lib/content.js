// Only approved public information belongs in this file. Never import portal records.
export const school = {
  name: 'Presbyterian High School',
  location: 'Mhondoro, Zimbabwe',
  motto: 'Nectamen consumebatur',
  mottoTranslation: 'Yet it was not consumed.',
  portalUrl: 'https://school-results-portal-blue.vercel.app/login',
  email: '',
  telephones: [
    { label: 'Head', number: '+263 773 543 474' },
    { label: 'Deputy Head', number: '+263 77 248 5543' },
    { label: 'Senior Master', number: '+263 77 336 5706' },
  ],
  address: 'P.O. Box 150, Mubaira, Chegutu District',
  physicalAddress: 'Madzongwe Village, Mhondoro, Zimbabwe',
  coordinates: [-18.2733326, 30.6652775],
  directionsUrl: 'https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=;-18.2733326,30.6652775',
  officeHours: '',
  mapUrl: 'https://www.openstreetmap.org/?mlat=-18.2733326&mlon=30.6652775#map=16/-18.2733326/30.6652775',
};

export const navigation = [
  ['About', '/about/'], ['Academics', '/academics/'],
  ['Admissions', '/admissions/'], ['School Life', '/school-life/'],
  ['News & Events', '/news/'],
];

export const programmes = [
  { id: 'junior', name: 'Junior Secondary', years: 'Forms 1 & 2', title: 'A foundation for what comes next.', description: 'The first years of secondary education are a time to discover interests, develop study habits and build confidence in learning.', details: ['Explore the transition into secondary school', 'Ask about the current subject offering', 'Find out how to prepare for Form 1'], note: 'The current subject list and transition arrangements will be published after school confirmation.' },
  { id: 'ordinary', name: 'Ordinary Level', years: 'Forms 3 & 4', title: 'Build knowledge. Find your direction.', description: 'Explore the next stage of secondary study, with a focus on subject choices, consistent preparation and the journey towards O-Level examinations.', details: ['Discuss available subjects with the school', 'Understand examination preparation', 'Explore pathways beyond Ordinary Level'], note: 'Subject availability, examination bodies and entry arrangements are awaiting school confirmation.' },
  { id: 'advanced', name: 'Advanced Level', years: 'Lower & Upper Sixth', title: 'Take the next step with purpose.', description: 'Advanced study is an opportunity to deepen subject knowledge and consider future study and career pathways.', details: ['Enquire about available subject combinations', 'Confirm the current entry criteria', 'Discuss progression and boarding availability'], note: 'Current combinations, entry criteria and places must be confirmed with the school.' },
];

// Future CMS adapters must filter to published, approved records before exposing data.
// News: {id, slug, title, excerpt, body: string[], category, date, author, status, approved, image?}
export const news = [];
// Events: {id, title, date: ISO date, venue, description, approved, status, enquiryUrl?}
export const events = [];
// Photographs of pupils require school approval before publication.
export const gallery = [
  { id: 'crest', src: '/images/school-crest.jpeg', alt: 'Presbyterian High School crest with a white cross, navy and red flames, and the Latin motto', caption: 'Our school crest', category: 'School Identity', approved: true },
];
export const galleryCategories = ['All', 'Campus', 'Classrooms', 'Sports', 'Ceremonies', 'Boarding', 'Student Life', 'School Identity'];

export const pageInfo = {
  about: { title: 'A school. A community. A shared purpose.', short: 'About Our School', description: 'Get to know Presbyterian High School in Mhondoro, Zimbabwe, and the identity expressed in our school crest and motto.' },
  academics: { title: 'Learning with a sense of purpose.', short: 'Academics', description: 'Explore the academic pathways outlined for Presbyterian High School, from foundational secondary learning to advanced studies.' },
  admissions: { title: 'Your next chapter starts here.', short: 'Admissions', description: 'Begin your journey at Presbyterian High School. Find a starting point for your questions about entry, study and school life.' },
  'school-life': { title: 'More than a place to learn.', short: 'School Life', description: 'Learning, character and community belong together. Discover the different parts of life at Presbyterian High School.' },
  news: { title: 'From our school community.', short: 'News & Events', description: 'School announcements, stories and dates to remember, in one place.' },
  gallery: { title: 'A closer look at our school.', short: 'Gallery', description: 'Explore school-approved photographs and the identity that brings our community together.' },
  alumni: { title: 'The connection continues.', short: 'Alumni & Development', description: 'Our school community extends beyond graduation. Alumni and friends can help celebrate the school’s heritage and support its future.' },
  contact: { title: 'Let’s start a conversation.', short: 'Contact', description: 'Questions about admissions, school life or reconnecting as an alumnus? Prepare an enquiry for the school.' },
  portal: { title: 'Your school. Your secure portal.', short: 'Student / Staff Portal', description: 'Students, teachers and administrators can use their existing accounts on the separate School Results Management Portal.' },
  privacy: { title: 'Your information matters.', short: 'Privacy Notice', description: 'How this review version of the public website handles information.' },
};
