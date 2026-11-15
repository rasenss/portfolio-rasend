import type { Label } from "@/lib/colors";

/* ------------------------------------------------------------------
 * Every word on the site lives here. Edit this file to update it.
 * ------------------------------------------------------------------ */

export const profile = {
  name: "Rasendriya Khansa Jolankarfyan",
  firstName: "Rasendriya Khansa",
  lastName: "Jolankarfyan",
  initials: "RK",
  location: "Pacitan, East Java, Indonesia",
  timezone: "Asia/Jakarta",
  email: "rasuen27@gmail.com",
  cv: "/cv.pdf",
  /** Portrait photo in /public. Set to null to show initials instead. */
  portrait: "/rasendriya.webp" as string | null,
  links: {
    linkedin: "https://www.linkedin.com/in/rasendriya-khansa/",
    github: "https://github.com/rasenss" as string | null,
    instagram: "https://www.instagram.com/rasendkhansa",
    discord: "https://discord.com/users/_.rasend",
  },
  summary:
    "I'm a final-year Computer Science student at Siber Muhammadiyah University, where I've studied since 2022 and hold a 3.51 GPA. Alongside my degree I've spent over a year as an AI data annotator, now on active projects at OneForma: annotating text, annotating images and checking they match their captions, and scoring AI answers against detailed rubrics. I also work as a UI/UX designer, designing interfaces in Figma.",
};

/**
 * The hero intro, written as annotated text.
 * Plain strings are ordinary words; objects are highlighted entities.
 */
export type Segment = string | { text: string; type: Label };

export const intro: Segment[][] = [
  [
    "I'm a final-year ",
    { text: "Computer Science student", type: "role" },
    " at ",
    { text: "Siber Muhammadiyah University", type: "org" },
    ", studying from ",
    { text: "Pacitan, East Java", type: "place" },
    " since 2022.",
  ],
  [
    "Alongside my degree I'm an ",
    { text: "AI data annotator", type: "role" },
    " at ",
    { text: "OneForma", type: "org" },
    ", doing ",
    { text: "text annotation", type: "skill" },
    ", ",
    { text: "image annotation", type: "skill" },
    " and ",
    { text: "rubric-based evaluation", type: "skill" },
    ". I also design interfaces as a ",
    { text: "UI/UX designer", type: "role" },
    " in ",
    { text: "Figma", type: "skill" },
    ".",
  ],
];

export const education = {
  school: "Siber Muhammadiyah University",
  place: "Yogyakarta, Indonesia",
  degree: "Computer Science, undergraduate",
  period: "2022 to present",
  gpa: "3.51 of 4.00",
  training: ["Red Hat Academy Program Learner (2024)", "Blue Team Junior Analyst Training", "AWS Academy Cloud Foundations"],
};

/* Jobs now live in content/experience, one text file per job. See "HOW TO ADD CONTENT.md". */

export type SkillCategory = "Annotation" | "Web" | "Data" | "Design" | "Cloud" | "Business";

export type Skill = { name: string; category: SkillCategory; icon: string };

export const skillCategories: { key: SkillCategory; title: string; label: Label; className: string; confidence: number }[] = [
  { key: "Annotation", title: "AI annotation and evaluation", label: "role", className: "ai_annotation", confidence: 0.99 },
  { key: "Web", title: "Programming and web", label: "skill", className: "web_dev", confidence: 0.96 },
  { key: "Design", title: "Design", label: "person", className: "ui_ux_design", confidence: 0.95 },
  { key: "Data", title: "Data and analysis", label: "place", className: "data_analysis", confidence: 0.93 },
  { key: "Cloud", title: "Cloud, Linux and security", label: "org", className: "cloud_security", confidence: 0.91 },
  { key: "Business", title: "Project and product", label: "person", className: "product", confidence: 0.88 },
];

export const skills: Skill[] = [
  { name: "Text and image annotation", category: "Annotation", icon: "tag" },
  { name: "Preference ranking", category: "Annotation", icon: "rank" },
  { name: "Rubric-based evaluation", category: "Annotation", icon: "rubric" },
  { name: "Golden response writing", category: "Annotation", icon: "star" },
  { name: "Cross-modal alignment", category: "Annotation", icon: "link" },
  { name: "Quality benchmarking", category: "Annotation", icon: "gauge" },
  { name: "HTML5", category: "Web", icon: "html" },
  { name: "CSS3", category: "Web", icon: "css" },
  { name: "JavaScript", category: "Web", icon: "js" },
  { name: "React", category: "Web", icon: "react" },
  { name: "SQL", category: "Data", icon: "sql" },
  { name: "Google BigQuery", category: "Data", icon: "cloud" },
  { name: "Microsoft Excel", category: "Data", icon: "table" },
  { name: "Figma", category: "Design", icon: "pen" },
  { name: "Wireframing", category: "Design", icon: "frame" },
  { name: "Prototyping", category: "Design", icon: "click" },
  { name: "Python", category: "Web", icon: "code" },
  { name: "Red Hat Enterprise Linux", category: "Cloud", icon: "terminal" },
  { name: "AWS Cloud Foundations", category: "Cloud", icon: "server" },
  { name: "Incident response basics", category: "Cloud", icon: "shield" },
  { name: "Project management", category: "Business", icon: "kanban" },
  { name: "IT product sales", category: "Business", icon: "briefcase" },
];

export type Evidence = { kind: "Role" | "Certificate" | "Project"; title: string; detail: string };

/** Where each skill was actually used or certified. Shown in the Skills inspector. */
export const skillEvidence: Record<string, Evidence[]> = {
  "Text and image annotation": [
    { kind: "Role", title: "Data Annotator, OneForma", detail: "Lighthouse project, Apr 2025 to now" },
    { kind: "Role", title: "AI Language Annotator, RWS", detail: "Lighthouse and Opal, Jul to Aug 2026" },
  ],
  "Preference ranking": [
    { kind: "Role", title: "Data Annotator, OneForma", detail: "Preference-ranking evaluations for Lighthouse" },
    { kind: "Role", title: "AI Language Annotator, RWS", detail: "Two concurrent workstreams" },
  ],
  "Rubric-based evaluation": [{ kind: "Role", title: "Natural Language Annotator, OneForma", detail: "Fred project, Sep 2026" }],
  "Golden response writing": [{ kind: "Role", title: "Natural Language Annotator, OneForma", detail: "Accuracy benchmarks for AI answers" }],
  "Cross-modal alignment": [
    { kind: "Role", title: "Data Annotator, OneForma", detail: "Image–text pair reviews" },
    { kind: "Role", title: "AI Language Annotator, RWS", detail: "Image curation and alignment reviews" },
  ],
  "Quality benchmarking": [{ kind: "Role", title: "Data Annotator, OneForma", detail: "Guideline revisions and internal quality audits" }],
  HTML5: [
    { kind: "Certificate", title: "Responsive Web Design", detail: "freeCodeCamp, 2024" },
    { kind: "Certificate", title: "Learn Basic Web Programming", detail: "Dicoding, 2023" },
    { kind: "Certificate", title: "Front-End Web Development for Beginners", detail: "Dicoding, 2024" },
  ],
  CSS3: [
    { kind: "Certificate", title: "Responsive Web Design", detail: "freeCodeCamp, 2024" },
    { kind: "Certificate", title: "Front-End Web Development for Beginners", detail: "Dicoding, 2024" },
  ],
  JavaScript: [
    { kind: "Certificate", title: "Learn Basic JavaScript Programming", detail: "Dicoding, 2023" },
    { kind: "Project", title: "Digital Skill Fair 23.0", detail: "Front-end JavaScript portfolio, 2024" },
  ],
  React: [{ kind: "Certificate", title: "Learn to Build Apps with React", detail: "Dicoding, 2024" }],
  Python: [{ kind: "Certificate", title: "Procedural Programming with Python", detail: "Dicoding, 2023" }],
  SQL: [
    { kind: "Certificate", title: "Structured Query Language (SQL)", detail: "Dicoding, 2023" },
    { kind: "Project", title: "Data Series 11.0", detail: "Chicago Taxi Trips analysis, 2024" },
  ],
  "Google BigQuery": [{ kind: "Project", title: "Data Series 11.0", detail: "Chicago Taxi Trips analysis, 2024" }],
  "Microsoft Excel": [{ kind: "Role", title: "Digital Marketing Intern, GAOTek", detail: "15+ market reports a month, 2024" }],
  Figma: [
    { kind: "Certificate", title: "UI/UX Designer Mini Course", detail: "Belajar Bekerja, 2024" },
    { kind: "Project", title: "WellSpark health app", detail: "Mobile app design" },
    { kind: "Project", title: "Login and sign-up flow", detail: "Mobile screens" },
  ],
  Wireframing: [
    { kind: "Certificate", title: "UI/UX Designer Mini Course", detail: "Belajar Bekerja, 2024" },
    { kind: "Project", title: "Product Series 3.0", detail: "Restaurant-ordering app, 2024" },
  ],
  Prototyping: [
    { kind: "Project", title: "Product Series 3.0", detail: "Prototype tested for usability, 2024" },
    { kind: "Certificate", title: "UI/UX Designer Mini Course", detail: "Belajar Bekerja, 2024" },
  ],
  "Red Hat Enterprise Linux": [{ kind: "Certificate", title: "Red Hat Academy Program Learner", detail: "Red Hat, 2024" }],
  "AWS Cloud Foundations": [{ kind: "Certificate", title: "AWS Academy Cloud Foundations", detail: "Amazon Web Services, 2025" }],
  "Incident response basics": [{ kind: "Certificate", title: "Blue Team Junior Analyst Pathway", detail: "Security Blue Team, 2024" }],
  "Project management": [{ kind: "Certificate", title: "Learn the Basics of Project Management", detail: "Dicoding, 2024" }],
  "IT product sales": [
    { kind: "Certificate", title: "IT Product Sales Specialist in B2B", detail: "Tomoru, 2024" },
    { kind: "Role", title: "Administrative Intern, Vriddhi Agency", detail: "Outreach for web design services, 2025" },
  ],
};

/* Certificates now live in public/certificates: just drop the picture or PDF in. See "HOW TO ADD CONTENT.md". */

/* Design work now lives in public/work: just drop the image in. See "HOW TO ADD CONTENT.md". */

export const languages = [
  { name: "Bahasa Indonesia", level: "Native", fill: 100 },
  { name: "English", level: "Professional", fill: 85 },
  { name: "Bahasa Melayu", level: "Conversational", fill: 60 },
];

/** Roman Latin sayings for the footer, shown in random order. Hover or tap to translate. */
export const latinQuotes: { latin: string; english: string; by: string }[] = [
  { latin: "Ad astra per aspera", english: "To the stars through hardship", by: "Latin saying" },
  { latin: "Carpe diem", english: "Seize the day", by: "Horace" },
  { latin: "Veni, vidi, vici", english: "I came, I saw, I conquered", by: "Julius Caesar" },
  { latin: "Alea iacta est", english: "The die is cast", by: "Julius Caesar" },
  { latin: "Audentes fortuna iuvat", english: "Fortune favours the bold", by: "Virgil" },
  { latin: "Fortes fortuna adiuvat", english: "Fortune helps the brave", by: "Terence" },
  { latin: "Labor omnia vincit", english: "Hard work conquers all", by: "Virgil" },
  { latin: "Sic itur ad astra", english: "This is the way to the stars", by: "Virgil" },
  { latin: "Possunt quia posse videntur", english: "They can because they think they can", by: "Virgil" },
  { latin: "Fama volat", english: "Rumour flies", by: "Virgil" },
  { latin: "Omnia fert aetas", english: "Time carries all things away", by: "Virgil" },
  { latin: "Festina lente", english: "Make haste slowly", by: "Augustus" },
  { latin: "Memento mori", english: "Remember that you will die", by: "Roman saying" },
  { latin: "Amor fati", english: "Love your fate", by: "Latin saying" },
  { latin: "Dum spiro, spero", english: "While I breathe, I hope", by: "Cicero" },
  { latin: "Fortuna caeca est", english: "Fortune is blind", by: "Cicero" },
  { latin: "Acta non verba", english: "Deeds, not words", by: "Latin saying" },
  { latin: "Vivere est militare", english: "To live is to fight", by: "Seneca" },
  { latin: "Docendo discimus", english: "By teaching, we learn", by: "Seneca" },
  { latin: "Errare humanum est", english: "To err is human", by: "Seneca" },
  { latin: "Imperare sibi maximum imperium est", english: "To rule yourself is the greatest power", by: "Seneca" },
  { latin: "Qui totum vult, totum perdit", english: "Who wants everything loses everything", by: "Seneca" },
  { latin: "Non scholae sed vitae discimus", english: "We learn not for school but for life", by: "Seneca" },
  { latin: "Nil desperandum", english: "Never despair", by: "Horace" },
  { latin: "Sapere aude", english: "Dare to be wise", by: "Horace" },
  { latin: "Ira furor brevis est", english: "Anger is a brief madness", by: "Horace" },
  { latin: "Gutta cavat lapidem", english: "Dripping water hollows the stone", by: "Ovid" },
  { latin: "Exitus acta probat", english: "The outcome judges the deed", by: "Ovid" },
  { latin: "Mens sana in corpore sano", english: "A sound mind in a sound body", by: "Juvenal" },
  { latin: "Quis custodiet ipsos custodes?", english: "Who will guard the guards themselves?", by: "Juvenal" },
  { latin: "Panem et circenses", english: "Bread and circuses", by: "Juvenal" },
  { latin: "Ex nihilo nihil fit", english: "Nothing comes from nothing", by: "Lucretius" },
  { latin: "Nulla dies sine linea", english: "No day without a line", by: "Pliny the Elder" },
  { latin: "Ubi concordia, ibi victoria", english: "Where there is unity, there is victory", by: "Publilius Syrus" },
  { latin: "Aut viam inveniam aut faciam", english: "I will find a way or make one", by: "Attributed to Hannibal" },
  { latin: "Si vis pacem, para bellum", english: "If you want peace, prepare for war", by: "After Vegetius" },
];



export const navLinks = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "work", label: "Design" },
  { id: "certificates", label: "Certificates" },
  { id: "contact", label: "Contact" },
];
