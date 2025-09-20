import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ArrowUpDown, Star, TrendingUp, Clock } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import FlashcardDeckCard from '../components/FlashcardDeckCard';
import FlashcardLikeButton from '../components/FlashcardLikeButton';
import { useGetDecksQuery, useLogViewMutation } from '../services/flashcardsApi';
import { Deck } from '../types/flashcards';
import './FlashcardsExplore.css';

type SortOption = 'popular' | 'newest' | 'difficulty' | 'official';

const FlashcardsExplore = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [difficultyFilter, setDifficultyFilter] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const { data: publicDecks = [], isLoading, error } = useGetDecksQuery({ mine: false });
  const [logView] = useLogViewMutation();

  // Get all unique tags for filter
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    publicDecks.forEach(deck => deck.tags.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [publicDecks]);

  // Filter and sort decks
  const filteredDecks = useMemo(() => {
    let filtered = publicDecks.filter(deck => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          deck.title.toLowerCase().includes(searchLower) ||
          deck.description?.toLowerCase().includes(searchLower) ||
          deck.tags.some(tag => tag.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Tag filter
      if (selectedTags.length > 0) {
        const hasSelectedTag = selectedTags.some(tag => deck.tags.includes(tag));
        if (!hasSelectedTag) return false;
      }

      // Difficulty filter
      if (difficultyFilter.length > 0) {
        if (!difficultyFilter.includes(deck.difficulty)) return false;
      }

      return true;
    });

    // Sort decks
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.likeCount - a.likeCount;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'difficulty':
          return a.difficulty - b.difficulty;
        case 'official':
          if (a.isOfficial !== b.isOfficial) {
            return a.isOfficial ? -1 : 1;
          }
          return b.likeCount - a.likeCount;
        default:
          return 0;
      }
    });

    return filtered;
  }, [publicDecks, searchTerm, selectedTags, sortBy, difficultyFilter]);

  const handleDeckClick = async (deck: Deck) => {
    // Log view for analytics
    try {
      await logView(deck.deckId);
    } catch (error) {
      console.error('Failed to log view:', error);
    }
    
    navigate(`/practice/flashcards/${deck.deckId}`);
  };

  const handleTagClick = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleDifficultyClick = (difficulty: number) => {
    setDifficultyFilter(prev =>
      prev.includes(difficulty)
        ? prev.filter(d => d !== difficulty)
        : [...prev, difficulty]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
    setDifficultyFilter([]);
  };

  const getDifficultyLabel = (difficulty: number): string => {
    const labels = ['Beginner', 'Easy', 'Medium', 'Hard', 'Expert', 'Master'];
    return labels[difficulty] || 'Unknown';
  };

  const getSortIcon = (option: SortOption) => {
    switch (option) {
      case 'popular': return <TrendingUp size={16} />;
      case 'newest': return <Clock size={16} />;
      case 'difficulty': return <ArrowUpDown size={16} />;
      case 'official': return <Star size={16} />;
      default: return null;
    }
  };

  return (
    <div className="flashcards-explore-page">
      <PageHeader
        title="Explore Flashcards"
        subtitle="Discover and study public flashcard decks created by the community"
      />

      <div className="flashcards-explore-controls">
        <div className="flashcards-explore-search">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search decks, tags, or topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flashcards-explore-actions">
          <button
            className={`flashcards-explore-filter-toggle ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            Filters
            {(selectedTags.length > 0 || difficultyFilter.length > 0) && (
              <span className="filter-count">
                {selectedTags.length + difficultyFilter.length}
              </span>
            )}
          </button>

          <select
            className="flashcards-explore-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            <option value="popular">Most Popular</option>
            <option value="newest">Newest First</option>
            <option value="difficulty">By Difficulty</option>
            <option value="official">Official First</option>
          </select>
        </div>
      </div>

      {showFilters && (
        <div className="flashcards-explore-filters">
          <div className="flashcards-explore-filter-section">
            <h4>Difficulty Level</h4>
            <div className="flashcards-explore-difficulty-filters">
              {[0, 1, 2, 3, 4, 5].map(difficulty => (
                <button
                  key={difficulty}
                  className={`difficulty-filter ${difficultyFilter.includes(difficulty) ? 'active' : ''}`}
                  onClick={() => handleDifficultyClick(difficulty)}
                >
                  {getDifficultyLabel(difficulty)}
                </button>
              ))}
            </div>
          </div>

          <div className="flashcards-explore-filter-section">
            <h4>Popular Tags</h4>
            <div className="flashcards-explore-tag-filters">
              {allTags.slice(0, 10).map(tag => (
                <button
                  key={tag}
                  className={`tag-filter ${selectedTags.includes(tag) ? 'active' : ''}`}
                  onClick={() => handleTagClick(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flashcards-explore-filter-actions">
            <button
              className="clear-filters"
              onClick={clearFilters}
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      <div className="flashcards-explore-results">
        <div className="flashcards-explore-results-header">
          <span className="results-count">
            {filteredDecks.length} deck{filteredDecks.length !== 1 ? 's' : ''} found
          </span>
          <div className="results-sort-indicator">
            {getSortIcon(sortBy)}
            <span>
              {sortBy === 'popular' && 'Most Popular'}
              {sortBy === 'newest' && 'Newest First'}
              {sortBy === 'difficulty' && 'By Difficulty'}
              {sortBy === 'official' && 'Official First'}
            </span>
          </div>
        </div>

        {isLoading && (
          <div className="flashcards-explore-loading">
            <div className="flashcards-loading-spinner" />
            <p>Loading public decks...</p>
          </div>
        )}

        {error && (
          <div className="flashcards-explore-error">
            <p>Failed to load decks. Please try again.</p>
          </div>
        )}

        {!isLoading && !error && filteredDecks.length === 0 && (
          <div className="flashcards-explore-empty">
            <Search size={64} />
            <h3>No decks found</h3>
            <p>Try adjusting your search terms or filters to find more decks.</p>
            <button className="clear-filters" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        )}

        {!isLoading && !error && filteredDecks.length > 0 && (
          <div className="flashcards-explore-grid">
            {filteredDecks.map((deck) => (
              <div key={deck.deckId} className="flashcards-explore-deck-wrapper">
                <FlashcardDeckCard
                  deck={deck}
                  onClick={() => handleDeckClick(deck)}
                />
                <div className="flashcards-explore-deck-actions">
                  <FlashcardLikeButton
                    deckId={deck.deckId}
                    initialLikeCount={deck.likeCount}
                    size="small"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardsExplore; 