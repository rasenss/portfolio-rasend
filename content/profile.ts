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
    "I'm a final-year Computer Science student with over a year of hands-on work in AI data annotation and language evaluation, currently on active evaluation projects at OneForma. My days are rubric-based evaluation, golden-response writing and checking that images and their captions actually match. A grounding in HTML, CSS, JavaScript, React and SQL means I also build the interfaces people use.",
};

/**
 * The hero intro, written as annotated text.
 * Plain strings are ordinary words; objects are highlighted entities.
 */
export type Segment = string | { text: string; type: Label };

export const intro: Segment[][] = [
  [
    "I'm a ",
    { text: "Computer Science student", type: "role" },
    " at ",
    { text: "Siber Muhammadiyah University", type: "org" },
    ", an ",
    { text: "AI data annotator", type: "role" },
    " at ",
    { text: "OneForma", type: "org" },
    " and a ",
    { text: "UI/UX designer", type: "role" },
    ", working from ",
    { text: "Pacitan, East Java", type: "place" },
    ".",
  ],
  [
    "I check how AI models read text and images, write the ",
    { text: "golden responses", type: "skill" },
    " they learn from, and design and build interfaces in ",
    { text: "Figma", type: "skill" },
    " and ",
    { text: "React", type: "skill" },
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

export type Experience = {
  company: string;
  role: string;
  type: string;
  period: string;
  /** first and last month worked, "YYYY-MM" (used to draw the timeline) */
  start: string;
  end: string;
  current?: boolean;
  project?: string;
  points: string[];
};

export const experience: Experience[] = [
  {
    company: "OneForma",
    role: "Data Annotator",
    type: "Remote contract",
    period: "Apr 2025 – now",
    start: "2025-04",
    end: "2026-11",
    current: true,
    project: "Lighthouse",
    points: [
      "Deliver text, image and preference-ranking annotations for the Lighthouse evaluation project, applying formal client guidelines to strengthen model training.",
      "Review image–text pairs for semantic and visual alignment, catching mismatches before they reach training pipelines.",
      "Keep accuracy high through recurring guideline revisions and internal quality audits, adapting quickly when evaluation standards change.",
    ],
  },
  {
    company: "OneForma",
    role: "Natural Language Annotator",
    type: "Remote contract",
    period: "Sep 2026 – now",
    start: "2026-09",
    end: "2026-11",
    current: true,
    project: "Fred",
    points: [
      "Annotated Indonesian-language user utterances, turning natural language into the structured intent representations AI systems depend on.",
      "Wrote golden responses and rubric-based evaluations that set the accuracy benchmark for AI-generated answers.",
      "Built intent-annotation frameworks tuned to Indonesian language patterns.",
    ],
  },
  {
    company: "RWS",
    role: "AI Language Annotator",
    type: "Remote contract",
    period: "Jul – Aug 2026",
    start: "2026-07",
    end: "2026-08",
    project: "Echo",
    points: [
      "Delivered text annotation, image annotation and preference-ranking evaluations across two concurrent projects.",
      "Curated images and reviewed cross-modal alignment, confirming visual and text components matched before submission.",
      "Worked with evaluation teams under formal written guidelines to meet client accuracy and data-quality standards.",
    ],
  },
  {
    company: "Vriddhi Agency",
    role: "Administrative Intern",
    type: "Remote, Malang",
    period: "Feb – Apr 2025",
    start: "2025-02",
    end: "2025-04",
    points: [
      "Researched more than ten companies a day and ran targeted email outreach pitching web design services, keeping contact records inside a strict three-hour daily window.",
    ],
  },
  {
    company: "BTPN Syariah",
    role: "Co-Facilitator Intern",
    type: "On-site, Pacitan",
    period: "Oct 2024 – Jan 2025",
    start: "2024-10",
    end: "2025-01",
    points: [
      "Ran workshops and field mentoring for more than ten small businesses on business fundamentals and digital literacy, with an average client competency rating of 71.3 out of 100.",
    ],
  },
  {
    company: "GAOTek Inc",
    role: "Digital Marketing Intern",
    type: "Remote, New York",
    period: "Apr – Aug 2024",
    start: "2024-04",
    end: "2024-08",
    project: "Market report team",
    points: [
      "Did SEO-driven market research and built structured data sets in Excel, delivering more than 15 market intelligence reports a month and presenting findings in weekly calls.",
    ],
  },
];

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

export type Certification = {
  title: string;
  issuer: string;
  year: number;
  image: string;
  verify?: string;
  covers: string[];
};

/** Newest first. `image` lives in /public/certs. */
export const certifications: Certification[] = [
  { title: "AWS Academy Cloud Foundations", issuer: "Amazon Web Services", year: 2025, image: "/certs/aws-academy-graduate-aws-academy-cloud-foundations-badge.webp", verify: "https://www.credly.com/badges/a89faf73-7775-432d-be7c-bff1417f4f2e/public_url", covers: ["Core AWS services", "Cloud security"] },
  { title: "Best of Next '25", issuer: "Google Cloud Asia Pacific", year: 2025, image: "/certs/best-of-next-25.webp", verify: "https://www.credential.net/22a4eba3-b7e6-4d25-9a94-5eb790b152bc#acc.BEJKkszy", covers: ["Google Cloud", "Generative AI"] },
  { title: "Cloud Technical Series", issuer: "Google Cloud Asia Pacific", year: 2025, image: "/certs/cloud-technical-series.webp", verify: "https://www.credential.net/01dc9d67-b5a3-4029-a6d4-a38587897c5d#acc.09FEAiZ", covers: ["Cloud infrastructure", "Deployment"] },
  { title: "Red Hat Academy Program Learner", issuer: "Red Hat", year: 2024, image: "/certs/redhatcertificate.webp", verify: "https://www.credly.com/badges/b02f1f65-d245-424f-a0c3-44b9470ea5d3/linked_in_profile", covers: ["Linux administration", "System management"] },
  { title: "Blue Team Junior Analyst Pathway", issuer: "Security Blue Team", year: 2024, image: "/certs/blue-team-junior-analyst-pathway.webp", covers: ["Threat detection", "Incident response"] },
  { title: "Responsive Web Design", issuer: "freeCodeCamp", year: 2024, image: "/certs/responsive-web-design-freecodecamp.webp", verify: "https://www.freecodecamp.org/certification/rasuen/responsive-web-design", covers: ["Flexbox and grid", "Accessibility"] },
  { title: "Front-End Web Development for Beginners", issuer: "Dicoding Indonesia", year: 2024, image: "/certs/front-end-web-development-for-beginners.webp", verify: "https://www.dicoding.com/certificates/RVZKRE6DMPD5", covers: ["HTML", "CSS", "Layout"] },
  { title: "Learn to Build Apps with React", issuer: "Dicoding Indonesia", year: 2024, image: "/certs/learn-to-build-apps-with-react.webp", verify: "https://www.dicoding.com/certificates/53XEQV61VXRN", covers: ["React", "Hooks"] },
  { title: "Learn Basic of AI", issuer: "Dicoding Indonesia", year: 2024, image: "/certs/learn-basic-of-ai.webp", verify: "https://www.dicoding.com/certificates/L4PQ5NJ77ZO1", covers: ["Machine learning concepts", "Prompt design"] },
  { title: "Learn the Basics of Project Management", issuer: "Dicoding Indonesia", year: 2024, image: "/certs/learn-the-basics-of-project-management.webp", verify: "https://www.dicoding.com/certificates/4EXGK6EKDZRL", covers: ["Agile", "Scheduling"] },
  { title: "Getting Started with Basic Programming to Become a Software Developer", issuer: "Dicoding Indonesia", year: 2024, image: "/certs/getting-started-with-basic-programming-to-become-a-software-developer.webp", verify: "https://www.dicoding.com/certificates/0LZ09EW20Z65", covers: ["Programming logic"] },
  { title: "IT Product Sales Specialist in B2B", issuer: "Tomoru", year: 2024, image: "/certs/it-product-sales-specialist-in-b2b.webp", covers: ["B2B sales", "IT products"] },
  { title: "Learn Basic JavaScript Programming", issuer: "Dicoding Indonesia", year: 2023, image: "/certs/learn-basic-javascript-programming.webp", verify: "https://www.dicoding.com/certificates/07Z64OVORPQR", covers: ["JavaScript", "DOM"] },
  { title: "Learn Basic Web Programming", issuer: "Dicoding Indonesia", year: 2023, image: "/certs/learn-basic-web-programming.webp", verify: "https://www.dicoding.com/certificates/L4PQ16967XO1", covers: ["Semantic HTML", "CSS"] },
  { title: "Structured Query Language (SQL)", issuer: "Dicoding Indonesia", year: 2023, image: "/certs/structured-query-language-sql.webp", verify: "https://www.dicoding.com/certificates/EYX4008JOPDL", covers: ["SQL queries", "Joins"] },
  { title: "Procedural Programming with Python", issuer: "Dicoding Indonesia", year: 2023, image: "/certs/procedural-programming-with-python.webp", verify: "https://www.dicoding.com/certificates/2VX3O526QZYQ", covers: ["Python", "Data structures"] },
];

export type ProjectKind = "App design" | "Posters" | "LinkedIn posts" | "Logos";

export type Project = {
  title: string;
  kind: ProjectKind;
  image: string;
  /** width / height of the image, so the grid reserves the right space */
  ratio: number;
  description: string;
  link?: { label: string; href: string };
};

/** Design work. Images live in /public/work. */
export const projects: Project[] = [
  {
    title: "WellSpark health app",
    kind: "App design",
    image: "/work/healthy-app.webp",
    ratio: 16 / 9,
    description: "A mobile app for tracking healthy habits: daily progress, goals and challenges, designed in Figma.",
    link: { label: "Open in Figma", href: "https://www.figma.com/community/file/1347842363347325628/healty-apps-mobile-apps" },
  },
  {
    title: "Login and sign-up flow",
    kind: "App design",
    image: "/work/login-page.webp",
    ratio: 16 / 9,
    description: "Sign-in, sign-up, PIN and verification screens for a mobile app, designed in Figma.",
    link: { label: "Open in Figma", href: "https://www.figma.com/community/file/1352653945260305149/login-page" },
  },
  {
    title: "TechXperience event poster",
    kind: "Posters",
    image: "/work/event-poster.webp",
    ratio: 792 / 1224,
    description: "Poster for the TechXperience event at the Innovation Center in Pacitan, 20 April 2024.",
  },
  {
    title: "TechXperience social post",
    kind: "Posters",
    image: "/work/social-poster.webp",
    ratio: 1,
    description: "Instagram post inviting people to join the TechXperience team.",
  },
  {
    title: "Rumah Dahan coffee menu",
    kind: "Posters",
    image: "/work/menu.webp",
    ratio: 1414 / 2000,
    description: "A printed coffee menu for a café, laid out by drink type with hot and iced prices.",
  },
  {
    title: "Data Series 11.0",
    kind: "LinkedIn posts",
    image: "/work/data-series.webp",
    ratio: 16 / 9,
    description: "Cover for my Dibimbing Data Series project, where I analysed the Chicago Taxi Trips dataset in SQL and BigQuery.",
    link: { label: "View on LinkedIn", href: "https://www.linkedin.com/posts/rasendriya-khansa_data-series-dibimbing-activity-7232003209798541312-iYpo" },
  },
  {
    title: "Product Series 3.0",
    kind: "LinkedIn posts",
    image: "/work/product-series.webp",
    ratio: 16 / 9,
    description: "Cover for my UI/UX mini portfolio from Dibimbing's Product Series, a restaurant-ordering app prototype.",
    link: { label: "View on LinkedIn", href: "https://www.linkedin.com/posts/rasendriya-khansa_product-series-30-activity-7179470267490992129-XuLa" },
  },
  {
    title: "Digital Skill Fair 23.0",
    kind: "LinkedIn posts",
    image: "/work/digital-skill-fair.webp",
    ratio: 16 / 9,
    description: "Cover for my front-end JavaScript portfolio from Dibimbing's Digital Skill Fair.",
    link: { label: "View on LinkedIn", href: "https://www.linkedin.com/posts/rasendriya-khansa_digital-skill-fair-230-activity-7157749829702504448-W4Tv" },
  },
  {
    title: "TechXperience logo",
    kind: "Logos",
    image: "/work/techxperience-logo.webp",
    ratio: 369 / 268,
    description: "Wordmark and symbol for the TechXperience community.",
  },
  {
    title: "Black & white logo",
    kind: "Logos",
    image: "/work/bnw-logo.webp",
    ratio: 369 / 251,
    description: "A monochrome wordmark concept.",
  },
  {
    title: "BnW monogram",
    kind: "Logos",
    image: "/work/bnw-logo-2.webp",
    ratio: 382 / 320,
    description: "An alternative monogram for the same black and white identity.",
  },
  {
    title: "Sugeng's Adventure emblem",
    kind: "Logos",
    image: "/work/emblem-logo.webp",
    ratio: 2,
    description: "A mountain emblem for an outdoor adventure group from Pacitan.",
  },
];

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
