import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { useGetDeckByIdQuery, useGetCardsQuery } from '../services/flashcardsApi';
import { startSession, flipCard, nextCard, markAnswer, endSession, shuffleCards, updateSettings } from '../store/slices/studySlice';
import { Loader, AlertTriangle, X, Shuffle, Lightbulb, CheckCircle, XCircle } from 'lucide-react';
import FlashcardProgressBar from '../components/FlashcardProgressBar';
import FlashcardToggle from '../components/FlashcardToggle';
import './StudyPage.css';

const StudyPage = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { data: deck } = useGetDeckByIdQuery(deckId!, { skip: !deckId });
  const { data: cards = [], isLoading: areCardsLoading, error: cardsError } = useGetCardsQuery(deckId!, { skip: !deckId });
  
  const { currentSession, isFlipped, sessionStats } = useAppSelector((state) => state.study);

  useEffect(() => {
    if (cards.length > 0) {
      dispatch(startSession({ deckId: deckId!, cards }));
    }
  }, [cards, deckId, dispatch]);

  const handleEndSession = () => {
    dispatch(endSession());
    navigate(`/practice/flashcards/${deckId}`);
  };

  const handleAnswer = (isCorrect: boolean) => {
    dispatch(markAnswer({ isCorrect }));
    dispatch(nextCard());
  };
  
  if (areCardsLoading) {
    return <div className="study-page-status"><Loader className="animate-spin" size={48} /></div>;
  }

  if (cardsError || !currentSession) {
    return (
      <div className="study-page-status">
        <AlertTriangle size={48} />
        <h3>Error Starting Session</h3>
        <p>Could not load the cards for this deck.</p>
      </div>
    );
  }

  const currentCard = currentSession.queue[currentSession.currentCardIndex];
  
  return (
    <div className="study-page">
      <div className="study-page-header">
        <div className="study-page-header-info">
          <h2>Studying: {deck?.title}</h2>
          <FlashcardProgressBar 
            current={currentSession.currentCardIndex + 1}
            total={sessionStats.totalCards}
            correctCount={sessionStats.correctCount}
            incorrectCount={sessionStats.incorrectCount}
            showStats
          />
        </div>
        <button onClick={handleEndSession} className="study-page-exit-button">
          <X size={24} />
        </button>
      </div>

      <div className="study-page-main">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.cardId}
            className="study-card-container"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="study-card"
              onClick={() => dispatch(flipCard())}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="study-card-face study-card-front">
                <p>{currentCard.frontText}</p>
              </div>
              <div className="study-card-face study-card-back">
                <p>{currentCard.backText}</p>
                {currentSession.settings.showHints && currentCard.hint && (
                  <div className="study-card-hint">
                    <Lightbulb size={16} />
                    <span>{currentCard.hint}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {isFlipped && (
        <motion.div 
          className="study-page-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <button className="study-action-button incorrect" onClick={() => handleAnswer(false)}>
            <XCircle size={24} />
            <span>Incorrect</span>
          </button>
          <button className="study-action-button correct" onClick={() => handleAnswer(true)}>
            <CheckCircle size={24} />
            <span>Correct</span>
          </button>
        </motion.div>
      )}

      <div className="study-page-settings">
          <FlashcardToggle 
            label="Shuffle"
            checked={currentSession.settings.shuffle}
            onChange={(checked) => {
                dispatch(updateSettings({ shuffle: checked }));
                if (checked) dispatch(shuffleCards());
            }}
            icon={<Shuffle size={16}/>}
          />
          <FlashcardToggle 
            label="Show Hints"
            checked={currentSession.settings.showHints}
            onChange={(checked) => dispatch(updateSettings({ showHints: checked }))}
            icon={<Lightbulb size={16}/>}
          />
      </div>
    </div>
  );
};

export default StudyPage; 