import { useMedia } from '../context/MediaContext';
import { useSearch } from '../context/SearchContext';
import MediaCard from '../components/MediaCard';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FiPlay,
  FiTrendingUp,
  FiMonitor,
  FiSmartphone,
  FiTablet,
  FiTv,
  FiHeadphones,
  FiCast,
} from 'react-icons/fi';

const heroDeviceIcons = [
  { Icon: FiMonitor, position: 'top-[12%] left-[5%] sm:left-[8%]', delay: 0 },
  { Icon: FiSmartphone, position: 'top-[16%] right-[6%] sm:right-[10%]', delay: 0.45 },
  { Icon: FiTablet, position: 'top-[44%] left-[3%] sm:left-[6%]', delay: 0.9 },
  { Icon: FiTv, position: 'bottom-[26%] right-[5%] sm:right-[9%]', delay: 1.35 },
  { Icon: FiHeadphones, position: 'bottom-[14%] left-[7%] sm:left-[10%]', delay: 1.8 },
  { Icon: FiCast, position: 'top-[38%] right-[4%] sm:right-[7%]', delay: 2.25 },
];

const heroIconPop = {
  scale: [0.35, 1.12, 1, 0.92, 0.35],
  opacity: [0, 1, 1, 0.95, 0],
  y: [18, -4, 0, 6, 20],
  rotate: [-6, 4, 0, -2, 6],
};

const heroIconPopTransition = (delay) => ({
  duration: 3.4,
  delay,
  repeat: Infinity,
  repeatDelay: 0.35,
  ease: 'easeInOut',
  times: [0, 0.14, 0.32, 0.62, 1],
});


const heroTitleContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.14, delayChildren: 0.08 },
  },
};

const heroTitleWord = {
  hidden: { opacity: 0, y: 36, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', damping: 14, stiffness: 120 },
  },
};

const heroBrand = {
  hidden: { opacity: 0, y: 36, scale: 0.92, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { type: 'spring', damping: 12, stiffness: 100 },
  },
};

const wordFloatAnimate = {
  y: [0, -8, 0],
  textShadow: [
    '0 0 18px rgba(255,255,255,0.2)',
    '0 0 36px rgba(255,255,255,0.45)',
    '0 0 18px rgba(255,255,255,0.2)',
  ],
};

const wordFloatTransition = (delay) => ({
  delay,
  duration: 2.6,
  repeat: Infinity,
  ease: 'easeInOut',
});

const Home = () => {
  const { media, continueWatching } = useMedia();
  const { searchQuery } = useSearch();
  const navigate = useNavigate();

  const featured = media.filter((item) => item.views > 100000).slice(0, 6);
  const recent = [...media].sort((a, b) => b.id - a.id).slice(0, 6);
  const filteredContinueWatching = continueWatching.slice(0, 6);

  const filteredMedia = searchQuery
    ? media.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {searchQuery ? (
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Search Results for "{searchQuery}"
          </h2>
          {filteredMedia.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMedia.map((item) => (
                <MediaCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                No results found for "{searchQuery}"
              </p>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Hero Section — animated background behind headline */}
          <div className="relative flex h-[60vh] min-h-[400px] items-center justify-center overflow-hidden bg-slate-950">
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-0"
              style={{
                background:
                  'linear-gradient(118deg, #1d4ed8 0%, #7c3aed 22%, #4338ca 45%, #0e7490 68%, #6d28d9 88%, #2563eb 100%)',
                backgroundSize: '320% 320%',
              }}
              animate={{
                backgroundPosition: ['0% 30%', '100% 70%', '50% 100%', '0% 30%'],
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -left-24 top-1/4 z-0 h-72 w-72 rounded-full bg-sky-400/30 blur-[100px] md:h-96 md:w-96"
              animate={{
                x: [0, 48, 0],
                y: [0, -36, 0],
                scale: [1, 1.18, 1],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -right-20 bottom-1/4 z-0 h-80 w-80 rounded-full bg-violet-500/25 blur-[110px] md:h-[28rem] md:w-[28rem]"
              animate={{
                x: [0, -56, 0],
                y: [0, 44, 0],
                scale: [1, 1.14, 1],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2">
              <motion.div
                aria-hidden
                className="h-56 w-56 rounded-full bg-indigo-300/20 blur-[88px] md:h-72 md:w-72"
                animate={{
                  opacity: [0.35, 0.75, 0.35],
                  scale: [0.92, 1.12, 0.92],
                }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
            <div className="absolute inset-0 z-[1] bg-black/30" />
            {heroDeviceIcons.map(({ Icon, position, delay }, index) => (
              <motion.div
                key={index}
                aria-hidden
                className={`pointer-events-none absolute z-20 ${position}`}
                animate={heroIconPop}
                transition={heroIconPopTransition(delay)}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/30 bg-white/15 shadow-lg backdrop-blur-md sm:h-14 sm:w-14 md:h-16 md:w-16">
                  <Icon className="h-5 w-5 text-white drop-shadow-md sm:h-6 sm:w-6 md:h-7 md:w-7" />
                </div>
              </motion.div>
            ))}
            {/* z-10 sits under icons (z-20) so device tiles stay visible; pointer-events passes through to children */}
            <div className="relative z-10 mx-auto max-w-4xl px-4 text-center text-white pointer-events-none">
              <div className="pointer-events-auto">
              <motion.h1
                className="text-5xl md:text-6xl font-bold mb-4 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-2"
                variants={heroTitleContainer}
                initial="hidden"
                animate="visible"
              >
                <motion.span variants={heroTitleWord} className="inline-block">
                  <motion.span
                    className="inline-block will-change-transform"
                    animate={wordFloatAnimate}
                    transition={wordFloatTransition(0.65)}
                  >
                    Welcome
                  </motion.span>
                </motion.span>
                <motion.span variants={heroTitleWord} className="inline-block">
                  <motion.span
                    className="inline-block will-change-transform"
                    animate={wordFloatAnimate}
                    transition={wordFloatTransition(0.82)}
                  >
                    to
                  </motion.span>
                </motion.span>
                <motion.span variants={heroBrand} className="inline-block">
                  <motion.span
                    className="inline-block bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent drop-shadow-sm will-change-transform"
                    animate={{
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                      y: [0, -9, 0],
                      scale: [1, 1.04, 1],
                      textShadow: [
                        '0 0 24px rgba(165,243,252,0.35)',
                        '0 0 42px rgba(255,255,255,0.55)',
                        '0 0 24px rgba(165,243,252,0.35)',
                      ],
                    }}
                    transition={{
                      backgroundPosition: {
                        duration: 5,
                        repeat: Infinity,
                        ease: 'linear',
                      },
                      y: {
                        delay: 0.95,
                        duration: 2.9,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      },
                      scale: {
                        delay: 0.95,
                        duration: 2.9,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      },
                      textShadow: {
                        delay: 0.95,
                        duration: 2.4,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      },
                    }}
                    style={{ backgroundSize: '200% auto' }}
                  >
                    MediaStream
                  </motion.span>
                </motion.span>
              </motion.h1>
              <motion.p
                className="text-xl md:text-2xl mb-8 text-gray-200"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                Stream videos, music, and view images all in one place
              </motion.p>
              <motion.button
                className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors flex items-center space-x-2 mx-auto"
                initial={{ opacity: 0, y: 14, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/browse')}
              >
                <FiPlay className="w-6 h-6" />
                <span>Start Watching</span>
              </motion.button>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 py-8">
            {/* Continue Watching */}
            {filteredContinueWatching.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                    <FiPlay className="w-6 h-6" />
                    <span>Continue Watching</span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                  {filteredContinueWatching.map((item) => (
                    <MediaCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}

            {/* Featured Content */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                  <FiTrendingUp className="w-6 h-6" />
                  <span>Featured Content</span>
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {featured.map((item) => (
                  <MediaCard key={item.id} item={item} />
                ))}
              </div>
            </section>

            {/* Recently Added */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Recently Added
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {recent.map((item) => (
                  <MediaCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;

