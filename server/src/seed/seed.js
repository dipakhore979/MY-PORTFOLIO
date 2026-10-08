import { connectDB, disconnectDB } from '../config/db.js';
import { env } from '../config/env.js';
import { Experience } from '../models/Experience.js';
import { Post } from '../models/Post.js';
import { Profile } from '../models/Profile.js';
import { Project } from '../models/Project.js';
import { Skill } from '../models/Skill.js';
import { User } from '../models/User.js';
import { slugify } from '../utils/slug.js';

const args = process.argv.slice(2);
const destroyOnly = args.includes('--destroy');
const adminOnly = args.includes('--admin-only'); // create admin + profile, never touch content
const force = args.includes('--force');

const GITHUB = 'https://github.com/dipakhore979';
const placeholder = (label) => ({
  url: `https://placehold.co/1200x675/png?text=${encodeURIComponent(label)}`,
  publicId: '',
});

const skills = [
  ['HTML', 'Frontend'],
  ['CSS', 'Frontend'],
  ['JavaScript', 'Frontend'],
  ['React.js', 'Frontend'],
  ['Tailwind CSS', 'Frontend'],
  ['Node.js', 'Backend'],
  ['Express.js', 'Backend'],
  ['MongoDB', 'Database'],
  ['Python', 'Languages'],
  ['Java', 'Languages'],
  ['Git & GitHub', 'Tools'],
].map(([name, category], i) => ({ name, category, order: i }));

const projects = [
  {
    title: 'Sample Project: Task Manager',
    description:
      'A full-stack task manager with authentication, drag-and-drop boards and real-time updates. Replace this sample from the admin dashboard.',
    content:
      '## Overview\n\nThis is sample content. Describe the problem, your approach, and what you learned.\n\n## Features\n\n- User authentication with JWT\n- CRUD for tasks and boards\n- Responsive UI',
    image: placeholder('Task Manager'),
    tech: ['React', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS'],
    liveUrl: 'https://example.com',
    githubUrl: GITHUB,
    featured: true,
    order: 1,
  },
  {
    title: 'Sample Project: Weather Dashboard',
    description:
      'A responsive weather dashboard that consumes a public API and visualises forecasts. Replace this sample from the admin dashboard.',
    content: '## Overview\n\nSample content for the project detail page.',
    image: placeholder('Weather Dashboard'),
    tech: ['React', 'JavaScript', 'CSS'],
    liveUrl: 'https://example.com',
    githubUrl: GITHUB,
    featured: true,
    order: 2,
  },
  {
    title: 'Sample Project: DSA Practice Tracker',
    description:
      'A small tool for tracking data structures and algorithms practice, built while learning Python and Java. Replace this sample from the admin dashboard.',
    content: '## Overview\n\nSample content for the project detail page.',
    image: placeholder('DSA Tracker'),
    tech: ['Python', 'Java', 'MongoDB'],
    liveUrl: '',
    githubUrl: GITHUB,
    featured: false,
    order: 3,
  },
].map((p) => ({ ...p, slug: slugify(p.title) }));

const experience = [
  {
    type: 'work',
    title: 'Full-Stack Developer (sample entry)',
    organization: 'Sample Company',
    location: 'Remote',
    startDate: new Date('2024-01-01'),
    current: true,
    description: 'Replace this with your real role. Built and shipped features across the MERN stack.',
    order: 1,
  },
  {
    type: 'education',
    title: 'Bachelor’s Degree in Computer Science (sample entry)',
    organization: 'Sample University',
    location: 'India',
    startDate: new Date('2020-08-01'),
    endDate: new Date('2024-06-01'),
    description: 'Replace this with your real education details.',
    order: 2,
  },
];

const postContent = [
  '## Hello, world',
  '',
  'This is a sample blog post written in **Markdown**. Edit or delete it from the admin dashboard.',
  '',
  '### Code blocks work too',
  '',
  '```js',
  "const greet = (name) => `Hello, ${name}!`;",
  "console.log(greet('world'));",
  '```',
  '',
  '- Lists render',
  '- Links render: [GitHub](' + GITHUB + ')',
].join('\n');

const posts = [
  {
    title: 'Hello World: Building My Portfolio with the MERN Stack',
    slug: 'hello-world-building-my-portfolio-with-the-mern-stack',
    excerpt: 'A sample post introducing this portfolio and the stack behind it.',
    content: postContent,
    tags: ['mern', 'webdev'],
    published: true,
    publishedAt: new Date(),
  },
];

const checkAdminEnv = () => {
  const { adminEmail, adminPassword } = env.seed;

  if (!adminEmail || !adminPassword) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env before seeding');
  }
  if (adminPassword.length < 10 || adminPassword === 'change-me-to-a-strong-password') {
    throw new Error('ADMIN_PASSWORD must be changed and at least 10 characters long');
  }
};

const profileDefaults = {
  name: 'Dipak Hore',
  role: 'Full-Stack Developer',
  tagline: 'I design and build fast, accessible web applications with the MERN stack.',
  description:
    'Portfolio of Dipak Hore, a full-stack developer building web apps with React, Node.js, Express and MongoDB.',
  bio: [
    'I am a full-stack developer who enjoys turning ideas into clean, responsive web applications. On the frontend I work with HTML, CSS, JavaScript, React and Tailwind CSS. On the backend I build REST APIs with Node.js and Express, backed by MongoDB.',
    'I also use Python and Java to practise data structures and algorithms, which helps me write cleaner and more efficient code.',
  ].join('\n\n'),
  email: 'dipakhore979@gmail.com',
  github: GITHUB,
  linkedin: 'https://www.linkedin.com/in/dipak-hore',
};

const ensureProfile = async () => {
  // Created only if missing, so edits made in the admin dashboard are never overwritten.
  const result = await Profile.updateOne(
    { key: 'main' },
    { $setOnInsert: { key: 'main', ...profileDefaults } },
    { upsert: true },
  );
  console.log(result.upsertedCount ? 'Profile created' : 'Profile already exists: left unchanged');
};

const ensureAdmin = async () => {
  const { adminName, adminEmail, adminPassword } = env.seed;

  const existing = await User.findOne({ email: adminEmail });
  if (existing) {
    console.log(`Admin ${adminEmail} already exists: left unchanged`);
    return;
  }
  await User.create({ name: adminName, email: adminEmail, password: adminPassword });
  console.log(`Admin user created: ${adminEmail}`);
};

const run = async () => {
  if (env.isProd && !force) {
    throw new Error('Refusing to run in production. Re-run with --force if you are sure.');
  }

  if (!destroyOnly) checkAdminEnv(); // validate first so a bad .env never wipes data

  await connectDB();

  if (adminOnly) {
    await ensureAdmin();
    await ensureProfile();
    return;
  }

  await Promise.all([
    Project.deleteMany(),
    Skill.deleteMany(),
    Experience.deleteMany(),
    Post.deleteMany(),
  ]);

  if (destroyOnly) {
    console.log('Projects, skills, experience and posts cleared (users and messages untouched).');
    return;
  }

  await ensureAdmin();
  await ensureProfile();
  await Skill.insertMany(skills);
  await Project.insertMany(projects);
  await Experience.insertMany(experience);
  for (const post of posts) await Post.create(post); // runs hooks (reading time)

  console.log(
    `Seeded ${skills.length} skills, ${projects.length} projects, ${experience.length} experience entries, ${posts.length} post(s).`,
  );
};

run()
  .catch((err) => {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  })
  .finally(disconnectDB);
