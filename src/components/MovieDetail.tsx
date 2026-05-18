import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Movie, deleteMovie } from '../services/movieService';
import { addToQueue } from '../services/interactionService';
import { useAppContext } from '../context/AppContext';

interface MovieDetailProps {
  movie: Movie | null;
  onClose: () => void;
}

export default function MovieDetail({ movie, onClose }: MovieDetailProps) {
  const { user } = useAppContext();
  
  if (!movie) return null;

  const greetingName = user?.email === 'oluwasaanumil@gmail.com' ? 'Mr Ladejobi' : 
                       user?.email === 'ayoolachristianah218@gmail.com' ? 'Motunrayo' : 
                       user?.displayName?.split(' ')[0] || 'Friend';

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to remove this film from the archive?")) {
      await deleteMovie(movie.id);
      onClose();
    }
  };

  const handleQueue = async () => {
    if (!user) return;
    await addToQueue(movie.id, user.uid, greetingName);
    onClose();
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" 
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-brand-ember/90 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-4xl bg-brand-mahogany border border-brand-copper/20 overflow-hidden flex flex-col md:flex-row shadow-2xl shadow-black max-h-[90vh] rounded-2xl"
        >
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 bg-brand-ember/80 backdrop-blur-md rounded-full text-brand-copper/60 hover:text-brand-copper border border-brand-copper/20 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>

          {/* Left Column: Image */}
          <div className="w-full md:w-2/5 aspect-2/3 md:aspect-auto md:h-150 relative border-b md:border-b-0 md:border-r border-brand-copper/10 bg-brand-ember shrink-0">
            {movie.imageUrl && (
              <img 
                src={movie.imageUrl} 
                alt={movie.title} 
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-overlay" 
              />
            )}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse,rgba(210,130,60,0.15)_0%,transparent_70%)] opacity-50" />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent" />
            
            <div className="absolute bottom-6 left-6 right-6">
              <span className="text-[10px] tracking-[0.2em] uppercase text-brand-copper mb-2 block font-body">
                {movie.year}
              </span>
              <h2 className="font-display text-3xl md:text-4xl text-brand-parchment leading-tight">
                {movie.title}
              </h2>
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="w-full md:w-3/5 p-8 md:p-12 flex flex-col bg-brand-mahogany overflow-y-auto relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_top_right,rgba(180,90,40,0.1)_0%,transparent_70%)] pointer-events-none" />
            
            <div className="mb-8">
              <h3 className="text-[10px] tracking-[0.25em] text-[#7a6255] uppercase mb-1 font-body">Genre</h3>
              <p className="font-display italic text-brand-copper text-lg md:text-xl relative z-10">
                {movie.genre || 'Cinema'}
              </p>
            </div>

            <div className="w-full h-px bg-linear-to-r from-brand-copper/20 to-transparent mb-8" />

            <div className="mb-10 flex-1">
              <h3 className="text-[10px] tracking-[0.25em] text-[#7a6255] uppercase mb-4 font-body">Notes & Description</h3>
              <p className="text-brand-cinder font-body text-sm md:text-base leading-relaxed font-light">
                {movie.description || "No specific details were added for this film. A quiet addition to the collection."}
              </p>
              
              <button
                onClick={handleQueue}
                className="mt-6 flex items-center gap-2 px-6 py-3 rounded-full border border-brand-copper/30 text-brand-copper uppercase tracking-[0.2em] text-[10px] hover:bg-brand-copper/10 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                   <path d="M12 5v14M5 12h14"/>
                </svg>
                Add to Watchlist
              </button>
            </div>

            <div className="mt-auto pt-8 border-t border-brand-copper/10">
              <div className="flex items-center justify-between">
                <span className="text-[9px] tracking-[0.2em] uppercase text-[#4a3a30] font-body">
                  Added to Archive
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-[9px] tracking-[0.2em] uppercase text-[#7a6255] font-body">
                    {movie.createdAt ? new Date(movie.createdAt.toMillis()).toLocaleDateString() : 'Recently'}
                  </span>
                  <button 
                    onClick={handleDelete}
                    className="text-[9px] tracking-[0.2em] uppercase text-red-900/60 hover:text-red-500 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
