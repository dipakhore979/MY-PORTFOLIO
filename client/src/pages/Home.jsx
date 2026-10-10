import About from '../components/sections/About';
import Contact from '../components/sections/Contact';
import Experience from '../components/sections/Experience';
import GitHubSection from '../components/sections/GitHubSection';
import Hero from '../components/sections/Hero';
import Projects from '../components/sections/Projects';
import ResumeSection from '../components/sections/ResumeSection';
import Seo from '../components/ui/Seo';
import { useSite } from '../context/ProfileContext';

export default function Home() {
  const site = useSite();
  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    jobTitle: site.role,
    url: site.url,
    email: `mailto:${site.email}`,
    sameAs: [site.github, site.linkedin],
  };

  return (
    <>
      <Seo path="/" jsonLd={personJsonLd} />
      <Hero />
      <About />
      <Projects />
      <Experience />
      <GitHubSection />
      <ResumeSection />
      <Contact />
    </>
  );
}
