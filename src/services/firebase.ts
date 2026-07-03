
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  arrayUnion,
  getDoc,
  increment,
  where,
  getDocs,
  deleteDoc,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface MessageReaction {
  id: string;
  messageId: string;
  type: 'thumbsUp' | 'thumbsDown';
  userId: string;
  timestamp: number;
}

export interface Message {
  id: string;
  text: string;
  timestamp: number;
  userId: string;
  reactions?: MessageReaction[];
}

export interface FirebaseQuestion {
  id: string;
  text: string;
  yesVotes: number;
  noVotes: number;
  maybeVotes: number;
  timestamp: number;
  messagesCount: number;
  voters: string[];
  activityScore: number;
  isHot: boolean;
  isBattleOfTheDay: boolean;
}

export interface QuestionStats {
  totalToday: number;
  totalThisWeek: number;
  mostControversial: FirebaseQuestion[];
  hotQuestions: FirebaseQuestion[];
  battleOfTheDay: FirebaseQuestion | null;
}

const calculateActivityScore = (question: FirebaseQuestion): number => {
  const now = Date.now();
  const questionAge = now - question.timestamp;
  const oneDayMs = 24 * 60 * 60 * 1000;
  
  // Only consider activity in last 24 hours
  if (questionAge > oneDayMs) return 0;
  
  const totalVotes = question.yesVotes + question.noVotes + question.maybeVotes;
  const recentMessages = question.messagesCount || 0;
  
  // Weight votes more heavily than messages
  const score = (totalVotes * 3) + (recentMessages * 2);
  
  // Apply time decay (more recent activity scores higher)
  const timeFactor = Math.max(0, 1 - (questionAge / oneDayMs));
  
  return Math.round(score * timeFactor);
};

const isControversial = (question: FirebaseQuestion): boolean => {
  const total = question.yesVotes + question.noVotes + question.maybeVotes;
  if (total < 5) return false; // Need minimum votes to be controversial
  
  const yesPercent = question.yesVotes / total;
  const noPercent = question.noVotes / total;
  
  // Controversial if yes/no split is close (between 30-70%)
  return Math.abs(yesPercent - noPercent) < 0.4;
};

export const questionsService = {
  // Subscribe to questions with sorting and filtering options
  subscribeToQuestions: (
    callback: (questions: FirebaseQuestion[]) => void,
    sortBy: 'newest' | 'trending' | 'controversial' = 'newest',
    limitCount: number = 20
  ) => {
    const q = query(
      collection(db, 'questions'), 
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    return onSnapshot(q, (snapshot) => {
      let questions = snapshot.docs.map(doc => {
        const data = doc.data();
        const question = {
          id: doc.id,
          ...data
        } as FirebaseQuestion;
        
        // Calculate real-time activity score
        question.activityScore = calculateActivityScore(question);
        question.isHot = question.activityScore > 10;
        
        return question;
      });
      
      // Apply sorting
      if (sortBy === 'trending') {
        questions.sort((a, b) => b.activityScore - a.activityScore);
      } else if (sortBy === 'controversial') {
        questions = questions.filter(isControversial);
        questions.sort((a, b) => {
          const totalA = a.yesVotes + a.noVotes + a.maybeVotes;
          const totalB = b.yesVotes + b.noVotes + b.maybeVotes;
          return totalB - totalA;
        });
      }
      
      callback(questions);
    });
  },

  // Get paginated questions
  getPaginatedQuestions: async (lastDoc?: QueryDocumentSnapshot<DocumentData>, limitCount: number = 10) => {
    let q = query(
      collection(db, 'questions'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    if (lastDoc) {
      q = query(
        collection(db, 'questions'),
        orderBy('timestamp', 'desc'),
        startAfter(lastDoc),
        limit(limitCount)
      );
    }
    
    const snapshot = await getDocs(q);
    const questions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FirebaseQuestion));
    
    return {
      questions,
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
      hasMore: snapshot.docs.length === limitCount
    };
  },

  // Get question statistics
  getQuestionStats: async (): Promise<QuestionStats> => {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
    
    // Get all questions for analysis
    const allQuestionsQuery = query(collection(db, 'questions'), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(allQuestionsQuery);
    
    const questions = snapshot.docs.map(doc => {
      const data = doc.data();
      const question = {
        id: doc.id,
        ...data
      } as FirebaseQuestion;
      question.activityScore = calculateActivityScore(question);
      question.isHot = question.activityScore > 10;
      return question;
    });
    
    // Calculate stats
    const totalToday = questions.filter(q => q.timestamp > oneDayAgo).length;
    const totalThisWeek = questions.filter(q => q.timestamp > oneWeekAgo).length;
    
    const mostControversial = questions
      .filter(isControversial)
      .sort((a, b) => {
        const totalA = a.yesVotes + a.noVotes + a.maybeVotes;
        const totalB = b.yesVotes + b.noVotes + b.maybeVotes;
        return totalB - totalA;
      })
      .slice(0, 3);
    
    const hotQuestions = questions
      .filter(q => q.isHot)
      .sort((a, b) => b.activityScore - a.activityScore)
      .slice(0, 5);
    
    // Battle of the day (most active question today)
    const battleOfTheDay = questions
      .filter(q => q.timestamp > oneDayAgo)
      .sort((a, b) => b.activityScore - a.activityScore)[0] || null;
    
    return {
      totalToday,
      totalThisWeek,
      mostControversial,
      hotQuestions,
      battleOfTheDay
    };
  },

  // Search questions by text
  searchQuestions: async (searchTerm: string) => {
    if (!searchTerm.trim()) return [];
    
    const q = query(collection(db, 'questions'), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    
    const questions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FirebaseQuestion));
    
    return questions.filter(question => 
      question.text.toLowerCase().includes(searchTerm.toLowerCase())
    );
  },

  // Subscribe to messages of a question
  subscribeToMessages: (
    questionId: string,
    callback: (messages: Message[]) => void,
    limitCount: number = 50
  ) => {
    const q = query(
      collection(db, 'questions', questionId, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(limitCount)
    );
    
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Message));
      callback(messages);
    });
  },

  // Add a new question
  addQuestion: async (text: string) => {
    await addDoc(collection(db, 'questions'), {
      text,
      yesVotes: 0,
      noVotes: 0,
      maybeVotes: 0,
      timestamp: Date.now(),
      messagesCount: 0,
      voters: [],
      activityScore: 0,
      isHot: false,
      isBattleOfTheDay: false
    });
  },

  // Vote on a question
  vote: async (questionId: string, voteType: 'yes' | 'no' | 'maybe', userId: string) => {
    const questionRef = doc(db, 'questions', questionId);
    const questionDoc = await getDoc(questionRef);
    
    if (questionDoc.exists()) {
      const data = questionDoc.data();
      
      if (data.voters?.includes(userId)) {
        return false;
      }

      const voteField = voteType === 'yes' ? 'yesVotes' : voteType === 'no' ? 'noVotes' : 'maybeVotes';
      await updateDoc(questionRef, {
        [voteField]: increment(1),
        voters: arrayUnion(userId)
      });
      
      return true;
    }
    return false;
  },

  // Add a message to a question
  addMessage: async (questionId: string, messageText: string, userId: string) => {
    const messagesCollectionRef = collection(db, 'questions', questionId, 'messages');
    await addDoc(messagesCollectionRef, {
      text: messageText,
      timestamp: Date.now(),
      userId,
      reactions: []
    });

    const questionRef = doc(db, 'questions', questionId);
    await updateDoc(questionRef, {
      messagesCount: increment(1)
    });
  },

  // Add reaction to a message
  addMessageReaction: async (questionId: string, messageId: string, reactionType: 'thumbsUp' | 'thumbsDown', userId: string) => {
    const messageRef = doc(db, 'questions', questionId, 'messages', messageId);
    const messageDoc = await getDoc(messageRef);
    
    if (messageDoc.exists()) {
      const data = messageDoc.data();
      const reactions = (data.reactions || []) as MessageReaction[];
      
      // Check if user already reacted
      const existingReaction = reactions.find(r => r.userId === userId);
      if (existingReaction) return false;
      
      const newReaction: MessageReaction = {
        id: Date.now().toString(),
        messageId,
        type: reactionType,
        userId,
        timestamp: Date.now()
      };
      
      await updateDoc(messageRef, {
        reactions: arrayUnion(newReaction)
      });
      return true;
    }
    
    return false;
  },

  // Delete old questions (15 days)
  deleteOldQuestions: async () => {
    const fifteenDaysAgo = Date.now() - (15 * 24 * 60 * 60 * 1000);
    const q = query(
      collection(db, 'questions'), 
      where('timestamp', '<', fifteenDaysAgo)
    );
    
    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map(async (questionDoc) => {
      // Delete messages subcollection first (Firestore doesn't delete subcollections automatically)
      const messagesCollectionRef = collection(db, 'questions', questionDoc.id, 'messages');
      const messagesSnapshot = await getDocs(messagesCollectionRef);
      const deleteMessagesPromises = messagesSnapshot.docs.map(messageDoc => deleteDoc(messageDoc.ref));
      await Promise.all(deleteMessagesPromises);

      // Delete the question document
      await deleteDoc(questionDoc.ref);
    });
    await Promise.all(deletePromises);
  }
};
