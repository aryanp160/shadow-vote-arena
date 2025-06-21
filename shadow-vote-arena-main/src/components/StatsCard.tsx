
import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Flame, Target, Calendar, Zap } from 'lucide-react';
import { questionsService, QuestionStats } from '@/services/firebase';

export const StatsCard: React.FC = () => {
  const [stats, setStats] = useState<QuestionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const questionStats = await questionsService.getQuestionStats();
        setStats(questionStats);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-cyan-400/30 rounded-2xl p-6 mb-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-4"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-cyan-400/30 rounded-2xl p-6 mb-8 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="text-cyan-400" size={24} />
        <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
          WAR ROOM INTEL
        </h2>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-black/50 rounded-xl p-4 border border-green-400/30">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="text-green-400" size={16} />
            <span className="text-green-400 font-bold text-xs">TODAY</span>
          </div>
          <div className="text-2xl font-black text-white">{stats.totalToday}</div>
          <div className="text-gray-400 text-xs">New Battles</div>
        </div>

        <div className="bg-black/50 rounded-xl p-4 border border-purple-400/30">
          <div className="flex items-center gap-2 mb-2">
            <Users className="text-purple-400" size={16} />
            <span className="text-purple-400 font-bold text-xs">THIS WEEK</span>
          </div>
          <div className="text-2xl font-black text-white">{stats.totalThisWeek}</div>
          <div className="text-gray-400 text-xs">Total Battles</div>
        </div>

        <div className="bg-black/50 rounded-xl p-4 border border-red-400/30">
          <div className="flex items-center gap-2 mb-2">
            <Target className="text-red-400" size={16} />
            <span className="text-red-400 font-bold text-xs">CONTROVERSIAL</span>
          </div>
          <div className="text-2xl font-black text-white">{stats.mostControversial.length}</div>
          <div className="text-gray-400 text-xs">Split Votes</div>
        </div>

        <div className="bg-black/50 rounded-xl p-4 border border-yellow-400/30">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="text-yellow-400" size={16} />
            <span className="text-yellow-400 font-bold text-xs">HOT</span>
          </div>
          <div className="text-2xl font-black text-white">{stats.hotQuestions.length}</div>
          <div className="text-gray-400 text-xs">Trending Now</div>
        </div>
      </div>

      {/* Battle of the Day */}
      {stats.battleOfTheDay && (
        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-4 border border-purple-400/50 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="text-yellow-400" size={20} />
            <span className="text-yellow-400 font-black text-sm">⚡ BATTLE OF THE DAY ⚡</span>
          </div>
          <p className="text-white font-bold text-sm mb-2 line-clamp-2">
            {stats.battleOfTheDay.text}
          </p>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-green-400">👍 {stats.battleOfTheDay.yesVotes}</span>
            <span className="text-yellow-400">🤔 {stats.battleOfTheDay.maybeVotes}</span>
            <span className="text-red-400">👎 {stats.battleOfTheDay.noVotes}</span>
            <span className="text-purple-400">💬 {stats.battleOfTheDay.messages.length}</span>
          </div>
        </div>
      )}

      {/* Hot Questions Preview */}
      {stats.hotQuestions.length > 0 && (
        <div className="bg-black/30 rounded-xl p-4 border border-orange-400/30">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="text-orange-400" size={16} />
            <span className="text-orange-400 font-bold text-sm">🔥 TRENDING BATTLES</span>
          </div>
          <div className="space-y-2">
            {stats.hotQuestions.slice(0, 3).map((question) => (
              <div key={question.id} className="text-xs text-gray-300 truncate">
                • {question.text}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
