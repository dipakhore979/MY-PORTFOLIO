import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { resumeUrl } from '../../api/endpoints';
import { useSite } from '../../context/ProfileContext';
import SocialLinks from '../ui/SocialLinks';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function Hero() {
  const site = useSite();
  return (
    <section id="home" className="relative isolate overflow-hidden" aria-label="Introduction">
      {/* decorative gradient orbs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute -right-24 top-40 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="container-page flex min-h-[calc(100vh-4rem)] flex-col justify-center py-20"
      >
        <motion.p variants={item} className="mb-4 text-lg font-medium text-brand-600 dark:text-brand-400">
          Hi, I&apos;m
        </motion.p>
        <motion.h1
          variants={item}
          className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-7xl dark:text-white"
        >
          {site.name}
        </motion.h1>
        <motion.p variants={item} className="heading-gradient mt-3 text-3xl font-bold sm:text-5xl">
          {site.role}
        </motion.p>
        <motion.p variants={item} className="mt-6 max-w-2xl text-lg text-slate-600 sm:text-xl dark:text-slate-400">
          {site.tagline}
        </motion.p>

        <motion.div variants={item} className="mt-10 flex flex-wrap items-center gap-3">
          <Link to="/#projects" className="btn btn-primary">
            View Projects
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link to="/#contact" className="btn btn-secondary">
            Contact Me
          </Link>
          <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
            <Download className="h-4 w-4" aria-hidden="true" />
            Resume
          </a>
        </motion.div>

        <motion.div variants={item} className="mt-8">
          <SocialLinks className="-ml-2" />
        </motion.div>
      </motion.div>

      <Link
        to="/#about"
        aria-label="Scroll to About section"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-slate-400 hover:text-brand-600 sm:block"
      >
        <ChevronDown className="h-6 w-6 animate-bounce motion-reduce:animate-none" />
      </Link>
    </section>
  );
}
