import { Outlet, useLocation } from 'react-router-dom';
import BackToTop from '../ui/BackToTop';
import ScrollProgress from '../ui/ScrollProgress';
import Footer from './Footer';
import Navbar from './Navbar';
import ScrollManager from './ScrollManager';
import SideNav from './SideNav';

export default function Layout() {
  const isHome = useLocation().pathname === '/';

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <ScrollProgress />
      <ScrollManager />
      <Navbar />
      <SideNav />
      <main
        id="main"
        tabIndex={-1}
        className={`flex-1 focus:outline-none ${isHome ? 'lg:pl-20 2xl:pl-0' : ''}`}
      >
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
