import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import Seo from '../components/ui/Seo';

export default function NotFound({ message = "The page you're looking for doesn't exist or has moved." }) {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <Seo title="Page not found" noindex path="/404" />
      <p className="heading-gradient text-8xl font-extrabold">404</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Page not found</h1>
      <p className="mt-2 max-w-md text-slate-600 dark:text-slate-400">{message}</p>
      <Link to="/" className="btn btn-primary mt-8">
        <Home className="h-4 w-4" aria-hidden="true" />
        Back to home
      </Link>
    </div>
  );
}
