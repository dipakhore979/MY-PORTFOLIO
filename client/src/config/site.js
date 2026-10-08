// Static site details. Skills, projects, experience and blog posts come from the API;
// the name, tagline, bio and photo below are the only things you edit in code.
// Put your photo at client/public/profile.jpg (a placeholder avatar shows until you do).
export const site = {
  name: 'Dipak Hore',
  initials: 'DH',
  role: 'Full-Stack Developer',
  tagline: 'I design and build fast, accessible web applications with the MERN stack.',
  description:
    'Portfolio of Dipak Hore, a full-stack developer building web apps with React, Node.js, Express and MongoDB.',
  url: (import.meta.env.VITE_SITE_URL || 'http://localhost:5173').replace(/\/$/, ''),
  photo: '/profile.jpg',
  email: 'dipakhore979@gmail.com',
  github: 'https://github.com/dipakhore979',
  linkedin: 'https://www.linkedin.com/in/dipak-hore',
  bio: [
    'I am a full-stack developer who enjoys turning ideas into clean, responsive web applications. On the frontend I work with HTML, CSS, JavaScript, React and Tailwind CSS. On the backend I build REST APIs with Node.js and Express, backed by MongoDB.',
    'I also use Python and Java to practise data structures and algorithms, which helps me write cleaner and more efficient code.',
  ],
};
