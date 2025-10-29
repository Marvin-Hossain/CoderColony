import {useState, useMemo} from 'react';
import {useNavigate} from 'react-router-dom';
import {Search, Filter, ArrowUpDown, Star, TrendingUp, Clock} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import FlashcardDeckCard from '../components/FlashcardDeckCard';
import FlashcardLikeButton from '../components/FlashcardLikeButton';
import {useGetDecksQuery, useLogViewMutation} from '../services/flashcardsApi';
import {Deck} from '../types/flashcards';

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
    <div className="min-h-screen bg-background">
      <div className="container py-20 space-y-10">
        <PageHeader
          title="Explore Flashcards"
          subtitle="Discover and study public flashcard decks created by the community"
        />

        <section className="space-y-6 rounded-2xl border bg-card p-6 shadow-lg">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative w-full" style={{minWidth: '260px'}}>
              <Search
                size={18}
                style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)'}}
              />
              <input
                type="text"
                placeholder="Search decks, tags, or topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-field w-full"
                style={{paddingLeft: '2.75rem'}}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${showFilters ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                style={{transition: 'all 0.2s ease'}}
              >
                <Filter size={16} />
                Filters
                {(selectedTags.length > 0 || difficultyFilter.length > 0) && (
                  <span className="inline-flex items-center rounded-full bg-danger/10 px-2 py-0.5 text-xs font-semibold text-danger">
                    {selectedTags.length + difficultyFilter.length}
                  </span>
                )}
              </button>

              <select
                className="form-field w-full sm:w-auto"
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
            <div className="space-y-6 rounded-2xl border bg-muted/20 p-4">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground">Difficulty Level</h4>
                <div className="flex flex-wrap gap-2">
                  {[0, 1, 2, 3, 4, 5].map(difficulty => {
                    const active = difficultyFilter.includes(difficulty);
                    return (
                      <button
                        key={difficulty}
                        type="button"
                        onClick={() => handleDifficultyClick(difficulty)}
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                        style={active ? {borderColor: 'var(--color-primary)'} : undefined}
                      >
                        {getDifficultyLabel(difficulty)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {allTags.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground">Popular Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {allTags.slice(0, 10).map(tag => {
                      const active = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagClick(tag)}
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                          style={active ? {borderColor: 'var(--color-primary)'} : undefined}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 rounded-full border border-danger bg-danger/10 px-4 py-2 text-xs font-semibold text-danger"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">
              {filteredDecks.length} deck{filteredDecks.length === 1 ? '' : 's'} found
            </span>
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
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
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border bg-card p-8 text-muted-foreground">
              <span
                className="inline-block h-10 w-10 animate-spin rounded-full"
                style={{
                  borderWidth: '4px',
                  borderStyle: 'solid',
                  borderColor: 'rgba(77, 107, 254, 0.2)',
                  borderTopColor: 'var(--color-primary)'
                }}
              />
              <p className="text-sm">Loading public decks...</p>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-danger bg-danger/10 px-4 py-3 text-danger">
              Failed to load decks. Please try again.
            </div>
          )}

          {!isLoading && !error && filteredDecks.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed bg-muted/20 px-6 py-12 text-center text-muted-foreground">
              <Search className="h-12 w-12" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-primary">No decks found</h3>
                <p className="max-w-md text-sm">
                  Try adjusting your search terms or filters to discover more decks.
                </p>
              </div>
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold text-primary"
              >
                Clear Filters
              </button>
            </div>
          )}

          {!isLoading && !error && filteredDecks.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredDecks.map((deck) => (
                <div key={deck.deckId} className="relative">
                  <FlashcardDeckCard
                    deck={deck}
                    onClick={() => handleDeckClick(deck)}
                  />
                  <div
                    className="absolute right-4 top-4 rounded-full border bg-card px-2 py-1 shadow-lg"
                    style={{backdropFilter: 'blur(6px)', backgroundColor: 'rgba(255, 255, 255, 0.9)'}}
                  >
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
        </section>
      </div>
    </div>
  );
};

export default FlashcardsExplore;
