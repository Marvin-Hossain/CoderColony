import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import InterviewQuestions from './InterviewQuestions';

// Mock navigate
vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual
  };
});

describe('InterviewQuestions', () => {
  // Improved typed mock helper
  const mockFetch = <T extends object>(responseData: T) => {
    return vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(responseData)
    } as Response);
  };

  // Test helper for common setup
  const renderComponent = (type: 'behavioral' | 'technical' = 'behavioral', title = 'Behavioral Questions') => {
    return render(
      <MemoryRouter>
        <InterviewQuestions type={type} title={title} />
      </MemoryRouter>
    );
  };

  // Helper to wait for loading to finish
  const waitForLoaded = async () => {
    await waitFor(() => expect(screen.queryByText("Loading...")).not.toBeInTheDocument());
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Question loading', () => {
    it('renders loading state initially', () => {
      vi.spyOn(global, 'fetch').mockImplementation(() => new Promise(() => {}));
      renderComponent();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('displays a question when loaded', async () => {
      mockFetch({ question: "Tell me about a time you solved a difficult problem." });
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText("Tell me about a time you solved a difficult problem.")).toBeInTheDocument();
      });
    });

    it('shows reset button when no more questions are available', async () => {
      mockFetch({ question: "No more questions for today! Please reset or come back tomorrow!" });
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText("No more questions for today! Please reset or come back tomorrow!")).toBeInTheDocument();
        expect(screen.getByText("Reset")).toBeInTheDocument();
      });
    });
  });

  describe('Response handling', () => {
    it('allows entering a response', async () => {
      mockFetch({ question: "Tell me about a time you solved a difficult problem." });
      renderComponent();
      await waitForLoaded();
      
      const textarea = screen.getByPlaceholderText(/Use the STAR method/);
      fireEvent.change(textarea, { target: { value: 'My test response' } });
      
      expect(textarea).toHaveValue('My test response');
    });

    it('handles submitting a response', async () => {
      mockFetch({ question: "Tell me about a time you solved a difficult problem." });
      renderComponent();
      await waitForLoaded();
      
      vi.clearAllMocks();
      mockFetch({ rating: 8, feedback: "Good response!" });
      
      const textarea = screen.getByPlaceholderText(/Use the STAR method/);
      fireEvent.change(textarea, { target: { value: 'My test response' } });
      fireEvent.click(screen.getByText('Get Feedback'));
      
      await waitFor(() => {
        expect(screen.getByText("Score: 8/10")).toBeInTheDocument();
        expect(screen.getByText("Good response!")).toBeInTheDocument();
      });
    });

    it('only enables Next Question button when rating is 6 or higher', async () => {
      mockFetch({ question: "Tell me about a time you solved a problem." });
      renderComponent();
      await waitForLoaded();
      
      vi.clearAllMocks();
      mockFetch({ rating: 5, feedback: "Needs improvement" });
      
      const textarea = screen.getByPlaceholderText(/Use the STAR method/);
      fireEvent.change(textarea, { target: { value: 'My response' } });
      fireEvent.click(screen.getByText('Get Feedback'));
      
      await waitFor(() => {
        expect(screen.getByText("Score: 5/10")).toBeInTheDocument();
        expect(screen.getByText("Next Question")).toBeDisabled();
      });
    });
  });

  describe('Button actions', () => {
    it('calls reset API when Reset button is clicked', async () => {
      mockFetch({ question: "No more questions for today! Please reset or come back tomorrow!" });
      renderComponent();
      
      await waitFor(() => expect(screen.getByText("Reset")).toBeInTheDocument());
      
      vi.clearAllMocks();
      mockFetch({ question: "New question after reset" });
      
      fireEvent.click(screen.getByText("Reset"));
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/reset"),
        expect.objectContaining({ method: "POST" })
      );
    });

    it('resets current question when Try Again is clicked', async () => {
      mockFetch({ question: "Tell me about a time you solved a problem." });
      renderComponent();
      await waitForLoaded();
      
      vi.clearAllMocks();
      mockFetch({ rating: 4, feedback: "Needs improvement" });
      
      const textarea = screen.getByPlaceholderText(/Use the STAR method/);
      fireEvent.change(textarea, { target: { value: 'My response' } });
      fireEvent.click(screen.getByText('Get Feedback'));
      
      await waitFor(() => expect(screen.getByText("Try Again")).toBeInTheDocument());
      
      vi.clearAllMocks();
      mockFetch({});
      
      fireEvent.click(screen.getByText("Try Again"));
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/reset-date"),
        expect.objectContaining({ 
          method: "POST",
          body: expect.stringContaining("question")
        })
      );
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
});
