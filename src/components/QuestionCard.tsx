
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Users, Clock, Flame, ThumbsUp, ThumbsDown } from 'lucide-react';
import { FirebaseQuestion, MessageReaction } from '@/services/firebase';

interface QuestionCardProps {
  question: FirebaseQuestion;
  onVote: (questionId: string, voteType: 'yes' | 'no' | 'maybe') => void;
  onAddMessage: (questionId: string, messageText: string) => void;
  onAddReaction: (questionId: string, messageId: string, reactionType: 'thumbsUp' | 'thumbsDown') => void;
  currentUserId?: string;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onVote,
  onAddMessage,
  onAddReaction,
  currentUserId
}) => {
  const [showChat, setShowChat] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [visibleMessages, setVisibleMessages] = useState(5);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to newest messages
  useEffect(() => {
    if (showChat && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [question.messages, showChat]);

  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - question.timestamp) / 1000);
      setTimeElapsed(elapsed);
    }, 1000);

    return () => clearInterval(timer);
  }, [question.timestamp]);

  const totalVotes = question.yesVotes + question.noVotes + question.maybeVotes;
  const yesPercentage = totalVotes > 0 ? Math.round((question.yesVotes / totalVotes) * 100) : 0;
  const noPercentage = totalVotes > 0 ? Math.round((question.noVotes / totalVotes) * 100) : 0;
  const maybePercentage = totalVotes > 0 ? Math.round((question.maybeVotes / totalVotes) * 100) : 0;

  const hasUserVoted = currentUserId && question.voters?.includes(currentUserId);
  const isControversial = totalVotes >= 5 && Math.abs(yesPercentage - noPercentage) < 40;

  const handleSubmitMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onAddMessage(question.id, newMessage.trim());
      setNewMessage('');
    }
  };

  const handleReaction = (messageId: string, reactionType: 'thumbsUp' | 'thumbsDown') => {
    if (currentUserId) {
      onAddReaction(question.id, messageId, reactionType);
    }
  };

  const getReactionCount = (reactions: MessageReaction[] = [], type: 'thumbsUp' | 'thumbsDown') => {
    return reactions.filter(r => r.type === type).length;
  };

  const hasUserReacted = (reactions: MessageReaction[] = [], userId: string) => {
    return reactions.some(r => r.userId === userId);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const loadMoreMessages = () => {
    setVisibleMessages(prev => prev + 10);
  };

  return (
    <div className="relative group">
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-cyan-400/30 rounded-2xl p-6 backdrop-blur-sm shadow-2xl">
        {/* Question Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold">
              <Clock size={16} />
              LIVE FOR {formatTime(timeElapsed)}
            </div>
            <div className="flex items-center gap-2">
              {question.isHot && (
                <div className="flex items-center gap-1 text-orange-400 text-sm font-bold bg-orange-900/30 px-2 py-1 rounded-lg border border-orange-400/30">
                  <Flame size={14} />
                  HOT
                </div>
              )}
              {question.isBattleOfTheDay && (
                <div className="flex items-center gap-1 text-yellow-400 text-sm font-bold bg-yellow-900/30 px-2 py-1 rounded-lg border border-yellow-400/30">
                  ⚡ BATTLE OF THE DAY
                </div>
              )}
              {isControversial && (
                <div className="flex items-center gap-1 text-red-400 text-sm font-bold bg-red-900/30 px-2 py-1 rounded-lg border border-red-400/30">
                  🎯 CONTROVERSIAL
                </div>
              )}
              <div className="flex items-center gap-2 text-purple-400 text-sm font-bold">
                <Flame size={16} />
                BATTLE ZONE
              </div>
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl text-white font-bold leading-tight mb-4">
            {question.text}
          </h3>
        </div>

        {/* Battle Voting Section */}
        <div className="mb-6">
          <div className="grid grid-cols-3 gap-3 mb-6">
            <button
              onClick={() => onVote(question.id, 'yes')}
              disabled={hasUserVoted}
              className={`group relative py-4 px-3 rounded-xl font-black text-lg transition-all duration-300 transform border-2 ${
                hasUserVoted 
                  ? 'bg-gray-800 border-gray-600 text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 border-green-400 text-white hover:scale-105 shadow-lg hover:shadow-green-500/50'
              }`}
            >
              <div className="text-xl mb-1">⚔️</div>
              <div className="text-sm">YES</div>
              <div className="text-xs font-bold mt-1">{question.yesVotes}</div>
              {!hasUserVoted && (
                <div className="absolute inset-0 bg-green-400/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
              )}
            </button>

            <button
              onClick={() => onVote(question.id, 'maybe')}
              disabled={hasUserVoted}
              className={`group relative py-4 px-3 rounded-xl font-black text-lg transition-all duration-300 transform border-2 ${
                hasUserVoted 
                  ? 'bg-gray-800 border-gray-600 text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-br from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 border-yellow-400 text-white hover:scale-105 shadow-lg hover:shadow-yellow-500/50'
              }`}
            >
              <div className="text-xl mb-1">🤔</div>
              <div className="text-sm">MAYBE</div>
              <div className="text-xs font-bold mt-1">{question.maybeVotes}</div>
              {!hasUserVoted && (
                <div className="absolute inset-0 bg-yellow-400/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
              )}
            </button>

            <button
              onClick={() => onVote(question.id, 'no')}
              disabled={hasUserVoted}
              className={`group relative py-4 px-3 rounded-xl font-black text-lg transition-all duration-300 transform border-2 ${
                hasUserVoted 
                  ? 'bg-gray-800 border-gray-600 text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-br from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 border-red-400 text-white hover:scale-105 shadow-lg hover:shadow-red-500/50'
              }`}
            >
              <div className="text-xl mb-1">🛡️</div>
              <div className="text-sm">NO</div>
              <div className="text-xs font-bold mt-1">{question.noVotes}</div>
              {!hasUserVoted && (
                <div className="absolute inset-0 bg-red-400/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
              )}
            </button>
          </div>

          {hasUserVoted && (
            <div className="text-center text-cyan-400 text-sm font-bold mb-4 bg-black/50 rounded-lg py-2">
              ⚡ VOTE RECORDED ⚡
            </div>
          )}

          {/* Battle Results */}
          {totalVotes > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-green-400">YES: {yesPercentage}%</span>
                <span className="text-yellow-400">MAYBE: {maybePercentage}%</span>
                <span className="text-red-400">NO: {noPercentage}%</span>
              </div>
              <div className="relative w-full bg-gray-800 rounded-full h-4 overflow-hidden border border-gray-600">
                <div className="h-full flex">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-1000 ease-out"
                    style={{ width: `${yesPercentage}%` }}
                  />
                  <div 
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-1000 ease-out"
                    style={{ width: `${maybePercentage}%` }}
                  />
                  <div 
                    className="bg-gradient-to-r from-red-500 to-rose-500 transition-all duration-1000 ease-out"
                    style={{ width: `${noPercentage}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-center text-purple-400 text-sm font-bold">
                <Users size={16} className="mr-2" />
                {totalVotes} WARRIORS VOTED
              </div>
            </div>
          )}
        </div>

        {/* Chat Section */}
        <div className="border-t border-gray-700 pt-6">
          <button
            onClick={() => setShowChat(!showChat)}
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-bold mb-4"
          >
            <MessageSquare size={18} />
            {question.messages.length} BATTLE COMMENTS
            <span className="text-xs bg-purple-600/30 px-2 py-1 rounded">
              {showChat ? 'HIDE' : 'SHOW'}
            </span>
          </button>

          {showChat && (
            <div className="space-y-4">
              {/* Messages */}
              <div className="max-h-60 overflow-y-auto space-y-3">
                {question.messages.slice(0, visibleMessages).map((message) => {
                  const reactions = message.reactions || [];
                  const thumbsUpCount = getReactionCount(reactions, 'thumbsUp');
                  const thumbsDownCount = getReactionCount(reactions, 'thumbsDown');
                  const userReacted = currentUserId ? hasUserReacted(reactions, currentUserId) : false;

                  return (
                    <div key={message.id} className="bg-black/60 border border-purple-400/30 rounded-lg p-3 backdrop-blur-sm">
                      <p className="text-gray-100 text-sm mb-2">{message.text}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-purple-400 text-xs font-bold">
                          {formatTime(Math.floor((Date.now() - message.timestamp) / 1000))} AGO
                        </p>
                        
                        {/* Message Reactions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleReaction(message.id, 'thumbsUp')}
                            disabled={userReacted}
                            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all ${
                              userReacted 
                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                : 'bg-green-900/30 hover:bg-green-800/50 text-green-400 hover:text-green-300'
                            }`}
                          >
                            <ThumbsUp size={12} />
                            {thumbsUpCount > 0 && <span>{thumbsUpCount}</span>}
                          </button>
                          
                          <button
                            onClick={() => handleReaction(message.id, 'thumbsDown')}
                            disabled={userReacted}
                            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all ${
                              userReacted 
                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                : 'bg-red-900/30 hover:bg-red-800/50 text-red-400 hover:text-red-300'
                            }`}
                          >
                            <ThumbsDown size={12} />
                            {thumbsDownCount > 0 && <span>{thumbsDownCount}</span>}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {question.messages.length > visibleMessages && (
                  <button
                    onClick={loadMoreMessages}
                    className="w-full bg-purple-900/30 hover:bg-purple-800/50 border border-purple-400/30 text-purple-400 py-2 rounded-lg text-sm font-bold transition-all"
                  >
                    ↓ LOAD MORE COMMENTS ({question.messages.length - visibleMessages} remaining)
                  </button>
                )}
                
                {question.messages.length === 0 && (
                  <p className="text-gray-500 text-sm italic text-center py-6 bg-black/30 rounded-lg">
                    No battle comments yet. Be the first to strike!
                  </p>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Add Message Form */}
              <form onSubmit={handleSubmitMessage} className="flex gap-2 sm:gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Drop your anonymous take..."
                  className="flex-1 bg-black/60 border border-cyan-400/30 rounded-lg px-3 sm:px-4 py-3 text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none backdrop-blur-sm text-sm sm:text-base min-w-0"
                  maxLength={200}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white px-4 sm:px-6 py-3 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 text-sm sm:text-base whitespace-nowrap flex-shrink-0"
                >
                  🔥 FIRE
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
