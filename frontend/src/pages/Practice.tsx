import {useNavigate} from 'react-router-dom';
import '@/styles/dashboard.css';
import '@/styles/progress.css';
import '@/styles/practice.css';

type PracticeOption = {
  title: string;
  description: string;
  tags: string[];
  href?: string;
  comingSoon?: boolean;
};

const practiceOptions: PracticeOption[] = [
  {
    title: "Behavioral Questions",
    description: "Practice answering questions about your past experiences using the STAR method.",
    tags: ["STAR Method", "Leadership", "Communication"],
    href: "/behavioral-questions"
  },
  {
    title: "Technical Questions",
    description: "Sharpen your software engineering fundamentals, algorithms, and problem solving.",
    tags: ["Algorithms", "Data Structures", "System Design"],
    href: "/technical-questions"
  },
  {
    title: "Flashcards",
    description: "Study with spaced repetition flashcards to memorize key concepts and definitions.",
    tags: ["Memory", "Spaced Repetition", "Study"],
    href: "/practice/flashcards",
    comingSoon: true
  },
  {
    title: "LeetCode Practice",
    description: "Solve coding challenges and get instant feedback on your solutions.",
    tags: ["Algorithms", "Problem Solving", "Time Complexity"],
    comingSoon: true
  },
  {
    title: "Mock Interviews",
    description: "Run realtime mock interviews with AI and receive actionable feedback.",
    tags: ["Video", "Real-time", "Body Language"],
    comingSoon: true
  }
];

const Practice = () => {
  const navigate = useNavigate();
  const getVariantClass = (title: string, comingSoon?: boolean): string => {
    if (comingSoon) return 'feature-card--purple';
    return '';
  };

  return (
    <main className="dash-container">
      <div className="dash-inner">
        {/* Hero */}
        <section className="practice-hero">
          <div className="decor-top-right" />
          <div className="decor-bottom-left" />
          <div className="practice-hero-content">
            <h1>Interview Practice</h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.92)' }}>
              Prepare for your interviews with AI-powered feedback
            </p>
          </div>
        </section>

        {/* Categories */}
        <section className="grid-12">
          {practiceOptions.map((option) => {
            const isDisabled = option.comingSoon || !option.href;
            const variantClass = getVariantClass(option.title, option.comingSoon);

            return (
              <div key={option.title} className="col-span-12 md-col-span-6 lg-col-span-4" style={{ marginBottom: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    if (!isDisabled && option.href) {
                      navigate(option.href);
                    }
                  }}
                  disabled={isDisabled}
                  className={`feature-card interactive-card ${variantClass}`}
                >
                  <div className="decor-top-right" />
                  <div className="decor-bottom-left" />
                  <div className="feature-card-content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div className="flex items-center justify-end" style={{ marginBottom: '1rem' }}>
                      {option.comingSoon && (
                        <span className="coming-soon-badge">Coming Soon</span>
                      )}
                    </div>

                    <div className="space-y-3" style={{ flex: 1 }}>
                      <h3 className="text-xl font-semibold" style={{ color: '#ffffff' }}>{option.title}</h3>
                      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.92)', lineHeight: 1.65 }}>
                        {option.description}
                      </p>
                    </div>

                    <div className="chips" style={{ marginTop: 'auto' }}>
                      {option.tags.map((tag) => (
                        <span
                          key={tag}
                          className="badge"
                          style={{
                            background: 'rgba(255,255,255,0.12)',
                            color: '#ffffff',
                            border: '1px solid rgba(255,255,255,0.20)'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
};

export default Practice;
