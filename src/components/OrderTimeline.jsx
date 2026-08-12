import { motion } from 'framer-motion';
import { Check, Package, Truck, Home } from 'lucide-react';

const STEPS = [
  {
    key: 'PENDING',
    label: 'Placed',
    icon: Package,
  },
  {
    key: 'CONFIRMED',
    label: 'Confirmed',
    icon: Check,
  },
  {
    key: 'SHIPPED',
    label: 'Shipped',
    icon: Truck,
  },
  {
    key: 'DELIVERED',
    label: 'Delivered',
    icon: Home,
  },
];

export default function OrderTimeline({ status }) {
  const currentIndex = STEPS.findIndex((step) => step.key === status);

  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="w-full">

      {/* Timeline */}
      <div className="flex items-start w-full">

        {STEPS.map((step, i) => {
          const isDone = i < activeIndex;
          const isActive = i === activeIndex;
          const Icon = step.icon;

          return (
            <div
              key={step.key}
              className={`
                flex items-start
                ${i === STEPS.length - 1 ? 'w-auto' : 'flex-1'}
                min-w-0
              `}
            >

              {/* Step */}
              <div className="flex flex-col items-center min-w-0">

                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    duration: 0.3,
                    delay: i * 0.08,
                  }}
                  className={`
                    w-8 h-8
                    sm:w-10 sm:h-10
                    rounded-full
                    flex items-center justify-center
                    flex-shrink-0
                    transition-colors
                    ${
                      isDone || isActive
                        ? 'bg-verdant text-paper'
                        : 'bg-stone text-ink/30'
                    }
                  `}
                >
                  {isDone ? (
                    <Check
                      size={15}
                      strokeWidth={2.5}
                    />
                  ) : (
                    <Icon
                      size={14}
                      strokeWidth={1.75}
                    />
                  )}
                </motion.div>

                {/* Label */}
                <span
                  className={`
                    mt-2
                    text-[9px]
                    sm:text-[11px]
                    font-mono
                    text-center
                    whitespace-nowrap
                    ${
                      isActive
                        ? 'text-verdant'
                        : isDone
                        ? 'text-ink/60'
                        : 'text-ink/30'
                    }
                  `}
                >
                  {step.label}
                </span>

              </div>

              {/* Connector */}
              {i < STEPS.length - 1 && (
                <div
                  className="
                    flex-1
                    h-0.5
                    mt-4
                    sm:mt-5
                    mx-1.5
                    sm:mx-3
                    bg-stone
                    relative
                    overflow-hidden
                    rounded-full
                  "
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: isDone ? '100%' : '0%',
                    }}
                    transition={{
                      duration: 0.4,
                      delay: i * 0.08 + 0.15,
                    }}
                    className="
                      absolute
                      inset-y-0
                      left-0
                      bg-verdant
                      rounded-full
                    "
                  />
                </div>
              )}

            </div>
          );
        })}

      </div>
    </div>
  );
}