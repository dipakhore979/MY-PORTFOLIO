import { useSite } from '../../context/ProfileContext';
import SocialLinks from '../ui/SocialLinks';

export default function Footer() {
  const site = useSite();
  return (
    <footer className="border-t border-slate-200 py-8 dark:border-slate-800">
      <div className="container-page flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} {site.name}. Built with the MERN stack.
        </p>
        <SocialLinks />
      </div>
    </footer>
  );
}
