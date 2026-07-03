
import React, { useState, useEffect } from 'react';
import { QuestionCard } from '@/components/QuestionCard';
import { SubmitQuestion } from '@/components/SubmitQuestion';
import { SearchBar } from '@/components/SearchBar';
import { StatsCard } from '@/components/StatsCard';
import { QuestionFilters } from '@/components/QuestionFilters';
import { Swords, Zap, ChevronDown } from 'lucide-react';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { questionsService, FirebaseQuestion } from '@/services/firebase';

const Index = () => {
  const { user, loading } = useFirebaseAuth();
  const [questions, setQuestions] = useState<FirebaseQuestion[]>([]);
  const [searchResults, setSearchResults] = useState<FirebaseQuestion[]>([]);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [currentSort, setCurrentSort] = useState<'newest' | 'trending' | 'controversial'>('newest');
  const [limitCount, setLimitCount] = useState(10);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Subscribe to real-time questions
  useEffect(() => {
    if (!user) return;

    const unsubscribe = questionsService.subscribeToQuestions(
      (loadedQuestions) => {
        setQuestions(loadedQuestions);
        setHasMore(loadedQuestions.length === limitCount);
      },
      currentSort,
      limitCount
    );

    return unsubscribe;
  }, [user, currentSort, limitCount]);

  // Clean up old questions on app load
  useEffect(() => {
    if (user) {
      questionsService.deleteOldQuestions().catch(console.error);
    }
  }, [user]);

  const handleSubmitQuestion = async (questionText: string) => {
    if (!user) return;
    
    try {
      await questionsService.addQuestion(questionText);
      setShowSubmitForm(false);
    } catch (error) {
      console.error('Error submitting question:', error);
    }
  };

  const handleVote = async (questionId: string, voteType: 'yes' | 'no' | 'maybe') => {
    if (!user) return;
    
    try {
      const success = await questionsService.vote(questionId, voteType, user.uid);
      if (!success) {
        console.log('You have already voted on this question');
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleAddMessage = async (questionId: string, messageText: string) => {
    if (!user) return;
    
    try {
      await questionsService.addMessage(questionId, messageText, user.uid);
    } catch (error) {
      console.error('Error adding message:', error);
    }
  };

  const handleAddReaction = async (questionId: string, messageId: string, reactionType: 'thumbsUp' | 'thumbsDown') => {
    if (!user) return;
    
    try {
      const success = await questionsService.addMessageReaction(questionId, messageId, reactionType, user.uid);
      if (!success) {
        console.log('You have already reacted to this message');
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handleSearch = async (searchTerm: string) => {
    setIsSearching(true);
    try {
      const results = await questionsService.searchQuestions(searchTerm);
      setSearchResults(results);
      setIsSearchMode(true);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchResults([]);
    setIsSearchMode(false);
  };

  const handleSortChange = (sort: 'newest' | 'trending' | 'controversial') => {
    setCurrentSort(sort);
    setLimitCount(10);
    setHasMore(true);
  };

  const loadMoreQuestions = () => {
    if (loadingMore || !hasMore || isSearchMode) return;
    setLimitCount(prev => prev + 10);
  };

  const displayQuestions = isSearchMode ? searchResults : questions;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 text-cyan-400 font-mono flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-3xl mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            ⚔️ ANONYMOUS WAR ROOM ⚔️
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 text-white font-mono">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-cyan-500/30">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
          <h1 className="text-2xl sm:text-4xl font-black text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 break-words">
            ⚔️ ANONYMOUS WAR ROOM ⚔️
          </h1>
          <p className="text-center text-cyan-300/80 text-xs sm:text-sm font-medium px-2">
            BATTLE OF DECISIONS • NO MERCY • ANONYMOUS JUDGMENT • AUTO-DELETE 15 DAYS
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Stats Dashboard */}
        <StatsCard />

        {/* Search Bar */}
        <SearchBar
          onSearch={handleSearch}
          onClear={handleClearSearch}
          isSearching={isSearching}
        />

        {/* Question Filters */}
        {!isSearchMode && (
          <QuestionFilters
            currentSort={currentSort}
            onSortChange={handleSortChange}
          />
        )}

        {/* Submit Button */}
        <div className="mb-8 text-center px-4">
          <button
            onClick={() => setShowSubmitForm(true)}
            className="group relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-black text-base sm:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/50 border border-purple-400/50 w-full sm:w-auto max-w-sm mx-auto"
          >
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <Swords size={20} className="group-hover:rotate-12 transition-transform flex-shrink-0" />
              <span className="truncate">ENTER THE ARENA</span>
              <Zap size={20} className="group-hover:scale-110 transition-transform flex-shrink-0" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
          </button>
        </div>

        {/* Submit Form Modal */}
        {showSubmitForm && (
          <SubmitQuestion
            onSubmit={handleSubmitQuestion}
            onCancel={() => setShowSubmitForm(false)}
          />
        )}

        {/* Search Results Header */}
        {isSearchMode && (
          <div className="mb-6 text-center">
            <p className="text-cyan-400 font-bold">
              {searchResults.length > 0 
                ? `Found ${searchResults.length} similar battle${searchResults.length !== 1 ? 's' : ''}`
                : 'No similar battles found'
              }
            </p>
          </div>
        )}

        {/* Current Filter Display */}
        {!isSearchMode && currentSort !== 'newest' && (
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-2 bg-black/50 border border-purple-400/30 rounded-xl px-4 py-2 text-purple-400 font-bold text-sm">
              {currentSort === 'trending' && <>🔥 SHOWING TRENDING BATTLES</>}
              {currentSort === 'controversial' && <>🎯 SHOWING CONTROVERSIAL BATTLES</>}
            </div>
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-8">
          {displayQuestions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              onVote={handleVote}
              onAddMessage={handleAddMessage}
              onAddReaction={handleAddReaction}
              currentUserId={user?.uid}
            />
          ))}
        </div>

        {/* Load More Button */}
        {!isSearchMode && hasMore && displayQuestions.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={loadMoreQuestions}
              disabled={loadingMore}
              className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 disabled:from-gray-900 disabled:to-gray-900 border border-gray-600 text-gray-300 disabled:text-gray-500 px-6 py-3 rounded-xl font-bold transition-all duration-200 flex items-center gap-2 mx-auto"
            >
              {loadingMore ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  LOADING MORE BATTLES...
                </>
              ) : (
                <>
                  <ChevronDown size={20} />
                  LOAD MORE BATTLES
                </>
              )}
            </button>
          </div>
        )}

        {displayQuestions.length === 0 && !isSearchMode && (
          <div className="text-center py-20">
            <div className="mb-6 text-6xl opacity-50">⚔️</div>
            <p className="text-2xl mb-4 text-cyan-300 font-bold">THE ARENA AWAITS</p>
            <p className="text-cyan-400/70">Be the first warrior to submit a battle!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
