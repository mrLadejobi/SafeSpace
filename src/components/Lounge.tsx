import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import { ChatMessage, QueueItem, subscribeToMessages, addMessage, subscribeToQueue, removeFromQueue, updateQueueOrder, SharedMood, subscribeToMood, updateMood } from '../services/interactionService';
import { Movie } from '../services/movieService';
import { useAppContext } from '../context/AppContext';
import { format } from 'date-fns';
import { Heart, Edit2, Check, X } from 'lucide-react';

interface LoungeProps {
  movies: Movie[];
}

export default function Lounge({ movies }: LoungeProps) {
  const { user } = useAppContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [mood, setMood] = useState<SharedMood | null>(null);
  const [isEditingMood, setIsEditingMood] = useState(false);
  const [newMoodText, setNewMoodText] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const greetingName = user?.email === 'oluwasaanumil@gmail.com' ? 'Mr Ladejobi' : 
                       user?.email === 'ayoolachristianah218@gmail.com' ? 'Motunrayo' : 
                       (user?.displayName ? user.displayName.split(' ')[0] : 'Friend');

  useEffect(() => {
    const unsubMessages = subscribeToMessages(setMessages);
    const unsubQueue = subscribeToQueue(setQueue);
    const unsubMood = subscribeToMood(setMood);
    return () => {
      unsubMessages();
      unsubQueue();
      unsubMood();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    await addMessage(newMessage.trim(), greetingName, user.uid);
    setNewMessage('');
  };

  const moodInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingMood) {
      moodInputRef.current?.focus();
    }
  }, [isEditingMood]);

  const handleUpdateMood = async () => {
    if (!user) return;
    try {
      const textToUpdate = newMoodText.trim() || 'No specific mood set.';
      await updateMood(textToUpdate, user.uid, greetingName);
      setIsEditingMood(false);
    } catch (error) {
      console.error("Failed to update mood:", error);
      alert("Failed to update mood. Please try again.");
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    
    // Optimistic UI update
    const items = Array.from(queue);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update local state immediately for smooth UI
    setQueue(items);

    // Persist to firestore
    await updateQueueOrder(items);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      
      {/* Top Mood Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0a0e15] border border-brand-copper/10 rounded-2xl p-4 flex items-center justify-between shadow-lg relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-linear-to-r from-brand-copper/5 to-transparent pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-10 h-10 rounded-full bg-brand-copper/10 flex items-center justify-center text-brand-copper">
            <Heart size={20} className={mood?.text ? "animate-pulse" : ""} />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#7a6255] block mb-1">Shared Mood</span>
            {isEditingMood ? (
              <div className="flex items-center gap-2">
                <input 
                  ref={moodInputRef}
                  type="text" 
                  value={newMoodText} 
                  onChange={e => setNewMoodText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleUpdateMood();
                    if (e.key === 'Escape') setIsEditingMood(false);
                  }}
                  placeholder="How are we feeling?"
                  className="bg-black/40 border border-brand-copper/30 rounded px-2 py-1 text-sm text-brand-parchment focus:outline-none focus:border-brand-copper w-48 md:w-64"
                />
                <button onClick={handleUpdateMood} className="text-green-500 hover:text-green-400 p-1"><Check size={18} /></button>
                <button onClick={() => setIsEditingMood(false)} className="text-red-500 hover:text-red-400 p-1"><X size={18} /></button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <p className="font-display italic text-brand-parchment text-lg">
                  {mood?.text || "Set a mood for the night..."}
                </p>
                <button 
                  onClick={() => {
                    setNewMoodText(mood?.text || '');
                    setIsEditingMood(true);
                  }}
                  className="text-[#7a6255] hover:text-brand-copper transition-colors"
                >
                  <Edit2 size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
        {mood?.updatedByName && !isEditingMood && (
          <div className="text-right hidden md:block relative z-10">
            <span className="text-[9px] uppercase tracking-widest text-[#4a3a30] block">Updated by</span>
            <span className="text-xs text-brand-copper/70 lowercase italic">{mood.updatedByName}</span>
          </div>
        )}
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6 w-full h-[70vh] md:h-[75vh]">
        
        {/* Shared Queue Section */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#0a0e15] border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative">
          <div className="p-6 border-b border-white/5 relative z-10 bg-[#0a0e15]/80 backdrop-blur-md">
            <h2 className="font-display text-2xl text-brand-parchment">Watchlist</h2>
            <p className="font-display italic text-brand-cinder text-sm mt-1">A curated queue for the two of you.</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            {queue.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-4 text-brand-copper">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
                  <path d="M8 12H16" />
                  <path d="M12 8V16" />
                </svg>
                <p className="font-display text-lg text-brand-parchment">The queue is empty.</p>
                <p className="font-body text-xs text-[#7a6255] mt-2">Add films from the Library to watch together.</p>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="watchlist-queue">
                  {(provided: DroppableProvided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                      {queue.map((item, index) => {
                        const movie = movies.find(m => m.id === item.movieId);
                        if (!movie) return null;
                        
                        return (
                          <Draggable key={item.id} draggableId={item.id} index={index}>
                            {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`flex items-center gap-4 bg-[#111620] border border-white/5 rounded-xl p-3 pr-4 group transition-shadow ${snapshot.isDragging ? 'shadow-2xl shadow-black ring-1 ring-brand-copper/30' : 'hover:border-white/10'}`}
                              >
                                <div className="w-12 h-16 rounded overflow-hidden shrink-0 bg-black/50">
                                  {movie.imageUrl && (
                                    <img src={movie.imageUrl} referrerPolicy="no-referrer" alt={movie.title} className="w-full h-full object-cover opacity-80" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-display text-lg text-brand-parchment truncate">{movie.title}</h3>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[9px] uppercase tracking-widest text-[#7a6255]">{movie.year}</span>
                                    <span className="w-1 h-1 rounded-full bg-white/10"></span>
                                    <span className="text-[9px] uppercase tracking-widest text-brand-copper/60 truncate">Added by {item.addedByName}</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => removeFromQueue(item.id)}
                                  className="lg:opacity-0 lg:group-hover:opacity-100 p-2 text-red-900/40 hover:text-red-500 transition-all shrink-0"
                                  title="Remove from queue"
                                >
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18" />
                                    <path d="M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>
        </div>

        {/* Intercom / Messages Section */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#0a0e15] border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative">
          <div className="p-6 border-b border-white/5 relative z-10 bg-[#0a0e15]/80 backdrop-blur-md">
            <h2 className="font-display text-2xl text-brand-parchment">Intercom</h2>
            <p className="font-display italic text-brand-cinder text-sm mt-1">Leave a note, share a thought.</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 scrollbar-hide flex flex-col gap-4">
            {messages.length === 0 ? (
               <div className="my-auto text-center opacity-50">
                 <p className="font-display text-lg text-brand-parchment">Quiet in here.</p>
               </div>
            ) : (
              messages.map((msg, i) => {
                const isMe = msg.senderUid === user?.uid;
                return (
                  <div key={msg.id} className={`flex flex-col max-w-[80%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                    {(() => {
                      const prevMsg = i > 0 ? messages[i-1] : null;
                      const msgSeconds = msg.createdAt?.seconds || 0;
                      const prevMsgSeconds = prevMsg?.createdAt?.seconds || 0;
                      const timeDiff = (msgSeconds && prevMsgSeconds) 
                        ? msgSeconds - prevMsgSeconds 
                        : 0;
                      const showHeader = i === 0 || prevMsg?.senderUid !== msg.senderUid || timeDiff > 300;
                      
                      if (!showHeader) return null;
                      
                      return (
                        <div className={`flex items-baseline gap-2 mb-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                          <span className="text-[10px] uppercase tracking-widest text-brand-copper/80">{msg.senderName}</span>
                          <span className="text-[9px] uppercase text-[#7a6255]">
                            {msg.createdAt && typeof msg.createdAt.toMillis === 'function' ? format(new Date(msg.createdAt.toMillis()), 'h:mm a') : '...'}
                          </span>
                        </div>
                      );
                    })()}
                    <div className={`px-4 py-3 rounded-2xl text-sm font-light leading-relaxed ${
                      isMe 
                        ? 'bg-brand-copper/10 text-brand-parchment border border-brand-copper/20 rounded-tr-sm' 
                        : 'bg-[#111620] text-brand-parchment border border-white/5 rounded-tl-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-white/5 relative z-10 bg-[#0a0e15]/80 backdrop-blur-md">
            <form onSubmit={handleSendMessage} className="relative flex items-center">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="w-full bg-[#161c28] border border-white/5 rounded-full py-3 px-6 pr-12 text-sm text-brand-parchment placeholder:text-[#7a6255] focus:outline-none focus:border-brand-copper/50 transition-colors"
              />
              <button 
                type="submit" 
                disabled={!newMessage.trim()}
                className="absolute right-2 p-2 rounded-full text-brand-copper/60 hover:text-brand-copper hover:bg-brand-copper/10 disabled:opacity-50 disabled:hover:bg-transparent transition-all"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>
          </div>
        </div>
      
      </div>
    </div>
  );
}
