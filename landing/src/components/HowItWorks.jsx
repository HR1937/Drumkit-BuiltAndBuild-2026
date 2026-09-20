import { motion } from "framer-motion";
import {
  Globe,
  Smartphone,
  Headphones,
  MapPin,
  UserRound,
  Clock3,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
} from "lucide-react";

const leftChannels = [
  {
    name: "Website",
    icon: Globe,
    color: "text-cyan-500",
    y: 90,
  },
  {
    name: "Mobile App",
    icon: Smartphone,
    color: "text-green-500",
    y: 210,
  },
  {
    name: "Call Center",
    icon: Headphones,
    color: "text-purple-500",
    y: 330,
  },
];

const rightInsights = [
  {
    name: "Unified Timeline",
    icon: Clock3,
    color: "text-blue-500",
    y: 90,
  },
  {
    name: "Issues & Support",
    icon: AlertTriangle,
    color: "text-red-500",
    y: 210,
  },
  {
    name: "Journey Analytics",
    icon: BarChart3,
    color: "text-orange-500",
    y: 330,
  },
];

const lineTransition = {
  duration: 0.9,
  ease: "easeInOut",
};

const nodeTransition = {
  duration: 0.55,
  ease: "easeOut",
};

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-paper px-6 py-28"
    >
      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            SECTION HEADING
        ====================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-thread">
            How Breeze Works
          </p>

          <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
            <span className="text-ink">
              From Fragmented Data to{" "}
            </span>
            <span className="text-thread">
              One Connected Journey
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted md:text-lg">
            Breeze connects interactions from every channel, resolves
            customer identities, and transforms fragmented events into one
            complete journey.
          </p>
        </motion.div>

        {/* =====================================================
            MAIN VISUALIZATION
        ====================================================== */}
        <div className="relative mx-auto h-[720px] max-w-6xl">

          {/* =====================================================
              SVG CONNECTION LINES
          ====================================================== */}
          <svg
            className="pointer-events-none absolute inset-0 z-0 h-full w-full"
            viewBox="0 0 1000 720"
            preserveAspectRatio="none"
          >
            {/* LEFT TOP */}
            <motion.path
              d="M 115 115
                 H 210
                 C 245 115 245 175 285 175
                 H 355"
              fill="none"
              stroke="currentColor"
              className="text-cyan-400"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: false, amount: 0.25 }}
              transition={{ ...lineTransition, delay: 0.1 }}
            />

            {/* LEFT MIDDLE */}
            <motion.path
              d="M 115 235
                 H 210
                 C 245 235 245 235 285 235
                 H 355"
              fill="none"
              stroke="currentColor"
              className="text-slate-300"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: false, amount: 0.25 }}
              transition={{ ...lineTransition, delay: 0.25 }}
            />

            {/* LEFT BOTTOM */}
            <motion.path
              d="M 115 355
                 H 210
                 C 245 355 245 295 285 295
                 H 355"
              fill="none"
              stroke="currentColor"
              className="text-slate-300"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: false, amount: 0.25 }}
              transition={{ ...lineTransition, delay: 0.4 }}
            />

            {/* RIGHT TOP */}
            <motion.path
              d="M 645 175
                 H 715
                 C 755 175 755 115 790 115
                 H 885"
              fill="none"
              stroke="currentColor"
              className="text-slate-300"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: false, amount: 0.25 }}
              transition={{ ...lineTransition, delay: 0.55 }}
            />

            {/* RIGHT MIDDLE */}
            <motion.path
              d="M 645 235
                 H 885"
              fill="none"
              stroke="currentColor"
              className="text-cyan-400"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: false, amount: 0.25 }}
              transition={{ ...lineTransition, delay: 0.7 }}
            />

            {/* RIGHT BOTTOM */}
            <motion.path
              d="M 645 295
                 H 715
                 C 755 295 755 355 790 355
                 H 885"
              fill="none"
              stroke="currentColor"
              className="text-slate-300"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: false, amount: 0.25 }}
              transition={{ ...lineTransition, delay: 0.85 }}
            />

            {/* CENTRAL DOWNWARD LINE */}
            <motion.path
              d="M 500 350 V 445"
              fill="none"
              stroke="currentColor"
              className="text-cyan-400"
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: false, amount: 0.25 }}
              transition={{ ...lineTransition, delay: 1 }}
            />

            {/* Animated data particles */}
            <motion.circle
              r="6"
              fill="currentColor"
              className="text-cyan-400"
              initial={{ cx: 115, cy: 115, opacity: 0 }}
              whileInView={{
                cx: [115, 210, 285, 355],
                cy: [115, 115, 175, 175],
                opacity: [0, 1, 1, 0],
              }}
              viewport={{ once: false, amount: 0.25 }}
              transition={{
                duration: 2.2,
                delay: 1,
                repeat: Infinity,
                repeatDelay: 1,
                ease: "linear",
              }}
            />

            <motion.circle
              r="6"
              fill="currentColor"
              className="text-cyan-400"
              initial={{ cx: 645, cy: 235, opacity: 0 }}
              whileInView={{
                cx: [645, 715, 790, 885],
                cy: [235, 235, 235, 235],
                opacity: [0, 1, 1, 0],
              }}
              viewport={{ once: false, amount: 0.25 }}
              transition={{
                duration: 2.2,
                delay: 1.4,
                repeat: Infinity,
                repeatDelay: 1,
                ease: "linear",
              }}
            />
          </svg>

          {/* =====================================================
              LEFT CHANNEL NODES
          ====================================================== */}
          <div className="absolute left-0 top-0 z-10 hidden h-full w-[24%] md:block">
            {leftChannels.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.name}
                  className="absolute left-0 flex items-center gap-3"
                  style={{ top: item.y }}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, amount: 0.25 }}
                  transition={{
                    ...nodeTransition,
                    delay: index * 0.15,
                  }}
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-ink/8 bg-surface shadow-md">
                    <Icon className={`h-8 w-8 ${item.color}`} />
                  </div>

                  <span className="whitespace-nowrap text-sm font-semibold text-ink/75">
                    {item.name}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* =====================================================
              RIGHT INSIGHT NODES
          ====================================================== */}
          <div className="absolute right-0 top-0 z-10 hidden h-full w-[24%] md:block">
            {rightInsights.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.name}
                  className="absolute right-0 flex flex-row-reverse items-center gap-3"
                  style={{ top: item.y }}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, amount: 0.25 }}
                  transition={{
                    ...nodeTransition,
                    delay: 0.45 + index * 0.15,
                  }}
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-ink/8 bg-surface shadow-md">
                    <Icon className={`h-8 w-8 ${item.color}`} />
                  </div>

                  <span className="whitespace-nowrap text-sm font-semibold text-ink/75">
                    {item.name}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* =====================================================
              CENTRAL NEXJOUR CARD
          ====================================================== */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{
              duration: 0.8,
              delay: 0.8,
              type: "spring",
              stiffness: 100,
            }}
            className="absolute left-1/2 top-[45px] z-20 w-[88%] -translate-x-1/2 md:w-[42%]"
          >
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-white shadow-2xl">

              {/* Glow */}
              <motion.div
                className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-orange-400/20 blur-3xl"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              <div className="relative z-10 text-center">

                <p className="text-sm font-medium text-orange-300">
                  BREEZE
                </p>

                <h3 className="mt-2 text-2xl font-bold md:text-3xl">
                  Customer 360
                </h3>

                {/* Customer identity circle */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{
                    duration: 0.6,
                    delay: 1.1,
                    type: "spring",
                  }}
                  className="mx-auto mt-7 flex h-24 w-24 items-center justify-center rounded-full bg-orange-500/20 ring-8 ring-orange-500/10"
                >
                  <UserRound className="h-11 w-11 text-orange-300" />
                </motion.div>

                <h4 className="mt-5 text-xl font-semibold">
                  Linked Customer
                </h4>

                <p className="mt-1 text-sm text-slate-400">
                  Identity resolved across channels
                </p>

                {/* Confidence badge */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{
                    duration: 0.5,
                    delay: 1.35,
                  }}
                  className="mx-auto mt-5 flex w-fit items-center gap-2 rounded-full bg-orange-600 px-4 py-2 text-xs font-semibold"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  High Identity Confidence
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* =====================================================
              MOBILE CHANNEL LIST
          ====================================================== */}
          <div className="absolute left-1/2 top-[385px] z-10 flex w-[88%] -translate-x-1/2 flex-wrap justify-center gap-3 md:hidden">
            {leftChannels.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-2 rounded-xl border border-ink/8 bg-surface px-3 py-2 shadow-sm"
                >
                  <Icon className={`h-4 w-4 ${item.color}`} />

                  <span className="text-xs font-medium text-ink/75">
                    {item.name}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* =====================================================
              BOTTOM UNIFIED JOURNEY CARD
          ====================================================== */}
          <motion.div
            initial={{ opacity: 0, y: 45, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.25 }}
            transition={{
              duration: 0.8,
              delay: 1.2,
              ease: "easeOut",
            }}
            className="absolute bottom-0 left-1/2 z-20 w-[92%] -translate-x-1/2 md:w-[58%]"
          >
            <div className="rounded-3xl bg-slate-900 p-7 text-white shadow-2xl">

              <div className="text-center">
                <p className="text-sm font-medium text-orange-300">
                  STITCHED JOURNEY
                </p>

                <h3 className="mt-1 text-2xl font-bold">
                  One Unified Customer Journey
                </h3>

                <p className="mx-auto mt-2 max-w-xl text-sm text-slate-400">
                  Every event, channel and support interaction connected in
                  chronological context.
                </p>
              </div>

              {/* Journey Items */}
              <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  {
                    icon: Globe,
                    label: "Events",
                  },
                  {
                    icon: Smartphone,
                    label: "Channels",
                  },
                  {
                    icon: AlertTriangle,
                    label: "Issues",
                  },
                  {
                    icon: CheckCircle2,
                    label: "Resolution",
                  },
                ].map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false, amount: 0.25 }}
                      transition={{
                        delay: 1.45 + index * 0.12,
                      }}
                      className="rounded-xl border border-slate-700 bg-slate-800/80 p-3 text-center"
                    >
                      <Icon className="mx-auto h-5 w-5 text-orange-300" />

                      <p className="mt-2 text-xs font-medium text-slate-300">
                        {item.label}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Statement */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{
            duration: 0.6,
            delay: 0.3,
          }}
          className="mx-auto mt-10 text-center text-sm font-medium text-muted"
        >
          <span className="text-ink">
            Ingest → Resolve → Stitch → Analyze
          </span>{" "}
          — one connected view of every customer journey.
        </motion.p>
      </div>
    </section>
  );
}
