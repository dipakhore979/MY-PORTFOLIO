import { motion } from 'framer-motion';

/** Fades and slides children in once they scroll into view. */
export default function Reveal({ children, delay = 0, className = '', as = 'div' }) {
  const Component = motion[as] || motion.div;
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    >
      {children}
    </Component>
  );
}
