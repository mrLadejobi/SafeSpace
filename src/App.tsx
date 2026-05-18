import { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from './context/AppContext';
import { subscribeToMovies, Movie, addCustomMovie } from './services/movieService';
import MovieDetail from './components/MovieDetail';

import Lounge from './components/Lounge';

export default function App() {
  const [activeTab, setActiveTab] = useState<'Library' | 'Curator' | 'Lounge'>('Library');
  const [showHome, setShowHome] = useState(true);
  const { user, loading, login, logout } = useAppContext();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  
  // Curator Form State
  const [formTitle, setFormTitle] = useState('');
  const [formYear, setFormYear] = useState('');
  const [formGenre, setFormGenre] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('');

  // Real-time fetching
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToMovies((fetchedMovies) => {
      setMovies(fetchedMovies);
    });
    return unsubscribe;
  }, [user]);

  const handleAddCustomMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await addCustomMovie({
      title: formTitle,
      year: parseInt(formYear) || new Date().getFullYear(),
      genre: formGenre,
      description: formDescription,
      imageUrl: formImage,
      userId: user.uid
    });
    setFormTitle('');
    setFormYear('');
    setFormGenre('');
    setFormDescription('');
    setFormImage('');
    setActiveTab('Library');
  };

  if (loading) {
    return <div className="min-h-screen bg-brand-ember text-brand-parchment flex items-center justify-center font-body">Loading...</div>;
  }

  // Determine user identity
  let greetingName = user?.displayName ? user.displayName.split(' ')[0] : 'there';
  if (user?.email === 'oluwasaanumil@gmail.com') {
    greetingName = 'Mr Ladejobi';
  } else if (user?.email === 'ayoolachristianah218@gmail.com') {
    greetingName = 'Motunrayo';
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-brand-ember text-brand-parchment flex flex-col items-center justify-center font-body relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-[radial-gradient(ellipse,rgba(210,130,60,0.1)_0%,transparent_60%)] rounded-full blur-3xl pointer-events-none" />
        
        {/* Creative Emblem Logo */}
        <div className="relative z-10 mb-8">
           <svg width="68" height="68" viewBox="0 0 68 68" fill="none">
             <circle cx="34" cy="34" r="33" className="stroke-brand-copper/20" strokeWidth="0.5"/>
             <circle cx="34" cy="34" r="22" className="stroke-brand-copper/10" strokeWidth="0.5"/>
             <path d="M34 14 C26 20 22 27 22 34 C22 41 26 48 34 54 C30 48 28 41 28 34 C28 27 30 20 34 14Z" className="fill-brand-copper/10 stroke-brand-copper/40" strokeWidth="0.5"/>
             <circle cx="34" cy="34" r="3.5" className="fill-brand-copper/25 stroke-brand-copper/70" strokeWidth="0.5"/>
           </svg>
        </div>
        
        <div className="font-display text-4xl tracking-[0.2em] uppercase mb-4 relative z-10 text-brand-parchment">
          Velvet Reel
        </div>
        <p className="font-display italic text-[#7a6255] text-lg mb-10 relative z-10">A private cinematic sanctuary.</p>
        
        <button 
          onClick={login}
          className="relative z-10 font-body text-xs tracking-[0.2em] uppercase text-brand-copper border border-brand-copper/35 rounded-full px-10 py-4 hover:bg-brand-copper/10 transition-colors"
        >
          Enter
        </button>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {showHome && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070504] overflow-hidden font-body"
          >
            {/* Deep rich lighting effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(210,130,60,0.08)_0%,transparent_60%)] pointer-events-none" />
            <motion.div 
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 4, ease: "easeOut" }}
              className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-[0.03] mix-blend-screen pointer-events-none" 
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, filter: "blur(8px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 2.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 text-center flex flex-col items-center"
            >
              <h1 className="font-display text-4xl md:text-5xl lg:text-7xl text-brand-parchment leading-tight tracking-wider font-light">
                Welcome {greetingName}
              </h1>
              
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2, duration: 1.5, ease: "easeOut" }}
                onClick={() => setShowHome(false)}
                className="mt-24 group flex flex-col items-center cursor-pointer p-4"
              >
                <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] text-[#7a6255] group-hover:text-brand-copper transition-colors duration-700 mb-6">
                  Enter Velvet Reel
                </span>
                <div className="w-px h-16 sm:h-20 bg-linear-to-b from-[#7a6255] to-transparent group-hover:from-brand-copper group-hover:h-32 transition-all duration-1000 ease-[0.16,1,0.3,1]" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-brand-ember text-brand-parchment font-body selection:bg-brand-copper/30 flex justify-center">
        <div className="w-full max-w-7xl relative min-h-screen bg-brand-mahogany overflow-x-hidden shadow-2xl flex flex-col md:border-x border-white/5">
        
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-100 bg-[radial-gradient(ellipse,rgba(210,130,60,0.12)_0%,transparent_70%)] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-125 h-199 bg-[radial-gradient(ellipse,rgba(180,90,40,0.08)_0%,transparent_70%)] rounded-full blur-3xl pointer-events-none" />

        {/* Global Nav */}
        <nav className="relative z-10 px-6 md:px-12 py-6 flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 backdrop-blur-md gap-6">
          <div className="flex items-center gap-4">
             <svg width="40" height="40" viewBox="0 0 68 68" fill="none">
               <circle cx="34" cy="34" r="33" className="stroke-brand-copper/30" strokeWidth="0.5"/>
               <circle cx="34" cy="34" r="22" className="stroke-brand-copper/20" strokeWidth="0.5"/>
               <path d="M34 14 C26 20 22 27 22 34 C22 41 26 48 34 54 C30 48 28 41 28 34 C28 27 30 20 34 14Z" className="fill-brand-copper/10 stroke-brand-copper/50" strokeWidth="0.5"/>
               <circle cx="34" cy="34" r="3.5" className="fill-brand-copper/40" strokeWidth="0.5"/>
             </svg>
            <div className="font-display tracking-[0.2em] text-sm uppercase text-brand-parchment">
              Velvet Reel
            </div>
          </div>
          <div className="flex flex-wrap gap-4 md:gap-8">
            {['Library', 'Lounge', 'Curator'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`text-[10px] md:text-[11px] tracking-[0.2em] uppercase transition-colors ${activeTab === tab ? 'text-brand-copper' : 'text-[#4a3a30] hover:text-[#7a6255]'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </nav>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto w-full px-6 md:px-12 py-8 md:py-12 relative z-10">
          
          {activeTab === 'Library' && (
            <div className="mx-auto mt-4 min-h-125">
               <h2 className="font-display text-2xl md:text-3xl mb-8 text-brand-parchment border-b border-brand-copper/20 pb-4">The Collection</h2>
               {movies.length === 0 ? (
                 <p className="text-brand-cinder italic font-display">The reel is currently empty.</p>
               ) : (
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                   {movies.map(movie => (
                     <div key={movie.id} onClick={() => setSelectedMovie(movie)} className="relative aspect-2/3 rounded-lg overflow-hidden border border-white/5 bg-[#0a0e15] group hover:border-brand-copper/30 transition-all cursor-pointer">
                        {movie.imageUrl && (
                          <img src={movie.imageUrl} referrerPolicy="no-referrer" alt={movie.title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-90 transition-all duration-500" />
                        )}
                        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent opacity-90" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="font-display text-lg md:text-xl truncate leading-tight mb-1">{movie.title}</h3>
                          <p className="text-[10px] md:text-xs uppercase tracking-[0.15em] text-brand-copper/80 truncate">{movie.year}</p>
                        </div>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          )}

          {activeTab === 'Lounge' && (
            <div className="mx-auto mt-4 px-2 md:px-0">
               <Lounge movies={movies} />
            </div>
          )}

          {activeTab === 'Curator' && (
            <div className="max-w-2xl mx-auto mt-4 px-4 py-8 border border-brand-copper/10 bg-black/20 rounded-2xl backdrop-blur-sm">
               <div className="text-center mb-10">
                 <h2 className="font-display text-3xl mb-2 text-brand-parchment">Curate the Reel</h2>
                 <p className="font-display italic text-brand-cinder">Add a distinct film to the sanctuary.</p>
               </div>

               <form onSubmit={handleAddCustomMovie} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-[10px] tracking-[0.2em] uppercase text-[#7a6255]">Title</label>
                     <input required type="text" value={formTitle} onChange={e => setFormTitle(e.target.value)} className="w-full bg-black/40 border border-brand-copper/20 rounded-sm px-4 py-3 text-sm focus:border-brand-copper/60 outline-none transition-colors" placeholder="e.g. In The Mood For Love" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] tracking-[0.2em] uppercase text-[#7a6255]">Year</label>
                     <input required type="number" value={formYear} onChange={e => setFormYear(e.target.value)} className="w-full bg-black/40 border border-brand-copper/20 rounded-sm px-4 py-3 text-sm focus:border-brand-copper/60 outline-none transition-colors" placeholder="e.g. 2000" />
                   </div>
                 </div>

                 <div className="space-y-2">
                   <label className="text-[10px] tracking-[0.2em] uppercase text-[#7a6255]">Genre / Category</label>
                   <input required type="text" value={formGenre} onChange={e => setFormGenre(e.target.value)} className="w-full bg-black/40 border border-brand-copper/20 rounded-sm px-4 py-3 text-sm focus:border-brand-copper/60 outline-none transition-colors" placeholder="e.g. Romance · Drama" />
                 </div>

                 <div className="space-y-2">
                   <label className="text-[10px] tracking-[0.2em] uppercase text-[#7a6255]">Cover Image URL</label>
                   <input required type="url" value={formImage} onChange={e => setFormImage(e.target.value)} className="w-full bg-black/40 border border-brand-copper/20 rounded-sm px-4 py-3 text-sm focus:border-brand-copper/60 outline-none transition-colors" placeholder="https://..." />
                   {formImage && (
                     <div className="mt-4 w-32 aspect-2/3 relative rounded-md overflow-hidden border border-brand-copper/20">
                       <img src={formImage} className="absolute inset-0 w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
                     </div>
                   )}
                 </div>

                 <div className="space-y-2">
                   <label className="text-[10px] tracking-[0.2em] uppercase text-[#7a6255]">Description / Notes</label>
                   <textarea required rows={4} value={formDescription} onChange={e => setFormDescription(e.target.value)} className="w-full bg-black/40 border border-brand-copper/20 rounded-sm px-4 py-3 text-sm focus:border-brand-copper/60 outline-none transition-colors resize-none" placeholder="Why add this film?" />
                 </div>

                 <button type="submit" className="w-full flex items-center justify-center gap-2 bg-brand-copper/10 hover:bg-brand-copper/20 border border-brand-copper/40 text-brand-copper uppercase tracking-[0.2em] text-xs py-4 rounded-sm transition-colors">
                   <Plus size={16} /> Add to Archive
                 </button>
               </form>
            </div>
          )}

        </div>

        {/* Footer Area */}
        <div className="relative z-10 px-6 md:px-12 py-5 mt-auto flex items-center justify-between border-t border-white/5 bg-brand-mahogany">
           <span className="text-[10px] tracking-widest text-[#4a3a30]">{movies.length} {movies.length === 1 ? 'film' : 'films'} in archive</span>
           <button onClick={logout} className="text-[9.5px] uppercase tracking-[0.22em] text-[#7a6255] hover:text-brand-parchment transition-colors">
             Sign out
           </button>
        </div>
        
        <MovieDetail movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      </div>
    </div>
    </>
  );
}
