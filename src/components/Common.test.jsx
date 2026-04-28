import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Card, SH, TabBtn, PB, ErrorBanner } from './Common';
import React from 'react';

describe('Common Components', () => {
  describe('Card', () => {
    it('renders children correctly', () => {
      render(<Card>Test Content</Card>);
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('applies custom styles', () => {
      const { container } = render(<Card style={{ marginTop: 10 }}>Styled Card</Card>);
      expect(container.firstChild).toHaveStyle('margin-top: 10px');
    });
  });

  describe('SH (Section Header)', () => {
    it('renders text correctly', () => {
      render(<SH>Main Title</SH>);
      expect(screen.getByText('Main Title')).toBeInTheDocument();
    });

    it('renders subtitle if provided', () => {
      render(<SH sub="A little subtitle">Main Title</SH>);
      expect(screen.getByText('Main Title')).toBeInTheDocument();
      expect(screen.getByText('A little subtitle')).toBeInTheDocument();
    });
  });

  describe('TabBtn', () => {
    it('renders children and handles clicks', () => {
      const handleClick = vi.fn();
      render(<TabBtn active={false} onClick={handleClick}>Click Me</TabBtn>);
      
      const button = screen.getByRole('button', { name: 'Click Me' });
      expect(button).toBeInTheDocument();
      
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('renders a badge if provided', () => {
      render(<TabBtn active={true} badge="3">Tab</TabBtn>);
      expect(screen.getByText('Tab')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('PB (Priority Badge)', () => {
    it('renders correct text', () => {
      render(<PB p="critical" />);
      expect(screen.getByText('critical')).toBeInTheDocument();
    });
  });

  describe('ErrorBanner', () => {
    it('does not render if error is null', () => {
      const { container } = render(<ErrorBanner error={null} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders error title and message', () => {
      const mockError = { title: 'Test Error', message: 'Something went wrong' };
      render(<ErrorBanner error={mockError} />);
      
      expect(screen.getByText('✕ Test Error')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('renders retry button and calls onRetry when clicked', () => {
      const handleRetry = vi.fn();
      const mockError = { title: 'Error', message: 'Oops', retryable: true };
      
      render(<ErrorBanner error={mockError} onRetry={handleRetry} />);
      
      const retryBtn = screen.getByRole('button', { name: 'Retry' });
      expect(retryBtn).toBeInTheDocument();
      
      fireEvent.click(retryBtn);
      expect(handleRetry).toHaveBeenCalledTimes(1);
    });

    it('does not render retry button if retryable is false', () => {
      const mockError = { title: 'Error', message: 'Oops', retryable: false };
      render(<ErrorBanner error={mockError} onRetry={vi.fn()} />);
      
      expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull();
    });
  });
});
