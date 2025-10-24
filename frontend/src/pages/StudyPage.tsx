import {useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {motion, AnimatePresence} from 'framer-motion';
import {useAppDispatch, useAppSelector} from '../hooks/redux';
import {useGetDeckByIdQuery, useGetCardsQuery, useGetUserCardProgressQuery, useUpdateCardProgressMutation, useSaveStudySessionMutation } from '../services/flashcardsApi';
import {startSession, flipCard, nextCard, markAnswer, endSession, shuffleCards, updateSettings} from '../store/slices/studySlice';
import {Loader, AlertTriangle, X, Shuffle, Lightbulb, CheckCircle, XCircle} from 'lucide-react';
import FlashcardProgressBar from '../components/FlashcardProgressBar';
import FlashcardToggle from '../components/FlashcardToggle';
import { useLeitner } from '../hooks/useLeitner';

const StudyPage = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { processAnswer, getDueCards } = useLeitner();

  const { data: deck } = useGetDeckByIdQuery(deckId!, { skip: !deckId });
  const { data: cards = [], isLoading: areCardsLoading, error: cardsError } = useGetCardsQuery(deckId!, { skip: !deckId });
  const { data: existingCardProgress, isLoading: areCardProgressesLoading } = useGetUserCardProgressQuery(deckId!, { skip: !deckId });
  const [updateCardProgress] = useUpdateCardProgressMutation();
  const [saveStudySession] = useSaveStudySessionMutation();

  const { currentSession, isFlipped, sessionStats } = useAppSelector((state) => state.study);

  useEffect(() => {
    if (cards.length > 0 && existingCardProgress) {
      const dueCardIds = getDueCards(cards.map(card => ({
        cardId: card.cardId,
        progress: existingCardProgress.find(p => p.cardId === card.cardId)
      })));
      
      const dueCardObjects = cards.filter(card => dueCardIds.includes(card.cardId));
      
      dispatch(startSession({ 
        deckId: deckId!, 
        cards: dueCardObjects.length > 0 ? dueCardObjects : cards
      }));
    }
  }, [cards, existingCardProgress, deckId, dispatch, getDueCards]);

  const handleEndSession = async () => {
    if (!currentSession) return;

    const startTimeIso = sessionStats.startTime ?? new Date().toISOString();
    const sessionDuration = Date.now() - new Date(startTimeIso).getTime();
    
    await saveStudySession({
      deckId: deckId!,
      sessionStats: {
        totalCards: sessionStats.totalCards,
        correctCount: sessionStats.correctCount,
        incorrectCount: sessionStats.incorrectCount,
        duration: Math.round(sessionDuration / 60000), // minutes
        startTime: startTimeIso,
        endTime: new Date().toISOString()
      }
    });
    
    dispatch(endSession());
    navigate(`/practice/flashcards/${deckId}`);
  };

  const handleAnswer = async (isCorrect: boolean) => {
    if (!currentSession) return;

    const currentCard = currentSession.queue[currentSession.currentCardIndex];
    const existingProgress = existingCardProgress?.find(p => p.cardId === currentCard.cardId);
    
    const leitnerResult = processAnswer(existingProgress || {}, isCorrect);
    
    await updateCardProgress({
      cardId: currentCard.cardId,
      deckId: currentCard.deckId,
      isCorrect,
      boxLevel: leitnerResult.newBoxLevel,
      nextReview: leitnerResult.nextReviewDate
    });
    
    dispatch(markAnswer({ isCorrect }));
    dispatch(nextCard());
  };
  
  if (areCardsLoading || areCardProgressesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container flex min-h-screen flex-col items-center justify-center gap-4 text-muted-foreground">
          <Loader className="h-10 w-10 animate-spin" />
          <p className="text-sm">Preparing your study session...</p>
        </div>
      </div>
    );
  }

  if (cardsError || !currentSession) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container flex min-h-screen flex-col items-center justify-center gap-4 text-center">
          <AlertTriangle className="h-12 w-12 text-danger" />
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-primary">Error starting session</h3>
            <p className="text-sm text-muted-foreground">Could not load the cards for this deck.</p>
          </div>
        </div>
      </div>
    );
  }

  const currentCard = currentSession.queue[currentSession.currentCardIndex];
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-20 space-y-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-primary">
              Studying: {deck?.title}
            </h2>
            <FlashcardProgressBar
              current={currentSession.currentCardIndex + 1}
              total={sessionStats.totalCards}
              correctCount={sessionStats.correctCount}
              incorrectCount={sessionStats.incorrectCount}
              showStats
            />
          </div>
          <button
            type="button"
            onClick={handleEndSession}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-card text-muted-foreground transition-transform hover:-translate-y-0.5"
            aria-label="End session"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCard.cardId}
              className="w-full max-w-3xl"
              initial={{opacity: 0, y: 50}}
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0, y: -50}}
              transition={{duration: 0.3}}
            >
              <motion.div
                onClick={() => dispatch(flipCard())}
                className="relative h-full w-full cursor-pointer rounded-2xl border bg-card p-12 text-center shadow-xl"
                style={{minHeight: '320px', transformStyle: 'preserve-3d'}}
                animate={{rotateY: isFlipped ? 180 : 0}}
                transition={{duration: 0.5}}
              >
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-6"
                  style={{backfaceVisibility: 'hidden'}}
                >
                  <p className="text-2xl font-semibold text-primary">{currentCard.frontText}</p>
                  <span className="text-xs text-muted-foreground">Tap to flip</span>
                </div>
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-6"
                  style={{backfaceVisibility: 'hidden', transform: 'rotateY(180deg)'}}
                >
                  <p className="text-2xl font-semibold text-primary">{currentCard.backText}</p>
                  {currentSession.settings.showHints && currentCard.hint && (
                    <div className="inline-flex items-center gap-2 rounded-full border bg-muted/20 px-4 py-2 text-xs font-medium text-muted-foreground">
                      <Lightbulb className="h-4 w-4" />
                      {currentCard.hint}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {isFlipped && (
          <motion.div
            className="flex flex-wrap items-center justify-center gap-4"
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: 0.2}}
          >
            <button
              type="button"
              onClick={() => handleAnswer(false)}
              className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold text-danger"
              style={{backgroundColor: 'rgba(229, 62, 62, 0.12)', borderColor: 'rgba(229, 62, 62, 0.35)'}}
            >
              <XCircle className="h-5 w-5" />
              Incorrect
            </button>
            <button
              type="button"
              onClick={() => handleAnswer(true)}
              className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold text-success"
              style={{backgroundColor: 'rgba(34, 197, 94, 0.15)', borderColor: 'rgba(34, 197, 94, 0.35)'}}
            >
              <CheckCircle className="h-5 w-5" />
              Correct
            </button>
          </motion.div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-4 rounded-2xl border bg-card p-6 shadow-lg">
          <FlashcardToggle
            label="Shuffle"
            checked={currentSession.settings.shuffle}
            onChange={(checked) => {
              dispatch(updateSettings({shuffle: checked}));
              if (checked) dispatch(shuffleCards());
            }}
            icon={<Shuffle className="h-4 w-4" />}
          />
          <FlashcardToggle
            label="Show hints"
            checked={currentSession.settings.showHints}
            onChange={(checked) => dispatch(updateSettings({showHints: checked}))}
            icon={<Lightbulb className="h-4 w-4" />}
          />
        </div>
      </div>
    </div>
  );
};

export default StudyPage;
