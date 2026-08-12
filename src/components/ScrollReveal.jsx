import { motion, useReducedMotion } from 'framer-motion';

const directions = {
  up: { y: 40, x: 0 },
  down: { y: -40, x: 0 },
  left: { y: 0, x: 40 },
  right: { y: 0, x: -40 },
  zoom: { y: 0, x: 0, scale: 0.92 },
};

export default function ScrollReveal({ children, direction = 'up', delay = 0, className = '' }) {
  const shouldReduceMotion = useReducedMotion();
  const offset = directions[direction] || directions.up;

  // Respects users who've turned on "reduce motion" in their OS settings
  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: offset.x, y: offset.y, scale: offset.scale ?? 1 }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}