// frontend/src/App.test.jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the home link', () => {
    render(<App />);
    const homeLink = screen.getByText(/HOME/i);
    expect(homeLink).toBeDefined();
  });

  it('renders the app title', () => {
    render(<App />);
    const title = screen.getByText(/HB-AI Movie Directory/i);
    expect(title).toBeDefined();
  });
});