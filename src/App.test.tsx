import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from './App';

describe('App Layout and Flow', () => {
  it('renders intro screen with title and gift box initially', () => {
    render(<App />);
    
    // Check for title
    expect(screen.getByText('Happy Birthday!')).toBeInTheDocument();
    expect(screen.getByText(/A little interactive space dedicated/)).toBeInTheDocument();
    
    // Check for gift box instructions
    expect(screen.getByText('Hover to tilt, click to unlock the secret')).toBeInTheDocument();
  });

  it('unlocks the board when the gift box is clicked', async () => {
    vi.useFakeTimers();
    render(<App />);

    const giftBoxBtn = screen.getByRole('button', { name: /Click to open the birthday gift/i });
    expect(giftBoxBtn).toBeInTheDocument();

    // Click the box to trigger open animation
    fireEvent.click(giftBoxBtn);

    // Fast-forward the lid animation timeout (1200ms)
    act(() => {
      vi.advanceTimersByTime(1200);
    });

    // Main board title should now be visible
    expect(screen.getByText('Cheers To You!')).toBeInTheDocument();
    expect(screen.getByText(/Celebrating your coding skills/)).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('allows clicking candles on the cake to extinguish them and unlock wishes form', async () => {
    vi.useFakeTimers();
    render(<App />);

    // Unlock board first
    const giftBoxBtn = screen.getByRole('button', { name: /Click to open the birthday gift/i });
    fireEvent.click(giftBoxBtn);
    act(() => {
      vi.advanceTimersByTime(1200);
    });

    // The guestbook should say that the form is locked initially
    expect(screen.getByText(/Blow out all the candles/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Your Name/i)).not.toBeInTheDocument();

    // Find and click all 5 candles to extinguish them
    for (let i = 1; i <= 5; i++) {
      const candle = screen.getByRole('button', { name: new RegExp(`Candle ${i}\\. Lit\\.`, 'i') });
      fireEvent.click(candle);
    }

    // Fast-forward the blowout timeout (1000ms)
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // The greetings bubble and form input fields should be unlocked
    expect(screen.getByText(/Magic Unlocked!/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Your Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Birthday wish text/i)).toBeInTheDocument();

    vi.useRealTimers();
  });
});
