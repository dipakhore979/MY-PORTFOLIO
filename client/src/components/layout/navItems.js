import { Briefcase, FileText, GraduationCap, Home, Mail, Rocket, User } from 'lucide-react';
import { GitHubIcon } from '../ui/SocialIcons';

/** One list drives the side dock, the top bar, the mobile menu and the footer. */
export const navItems = [
  { id: 'home', label: 'Home', icon: Home, to: '/' },
  { id: 'about', label: 'About', icon: User, to: '/#about' },
  { id: 'projects', label: 'Projects', icon: Rocket, to: '/#projects' },
  { id: 'experience', label: 'Experience', icon: Briefcase, to: '/#experience' },
  { id: 'education', label: 'Education', icon: GraduationCap, to: '/#education' },
  { id: 'github', label: 'GitHub', icon: GitHubIcon, to: '/#github' },
  { id: 'resume', label: 'Resume', icon: FileText, to: '/#resume' },
  { id: 'contact', label: 'Contact', icon: Mail, to: '/#contact' },
];

export const sectionIds = navItems.map((item) => item.id);

// Shorter list for the top bar on medium screens (no side dock there)
export const topBarItems = navItems.filter((item) => !['home', 'resume'].includes(item.id));
