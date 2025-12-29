import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Contact from '../components/Contact';

// Mock fetch
global.fetch = jest.fn();

// Mock trackEvent
jest.mock('../lib/error-monitoring', () => ({
  trackEvent: jest.fn(),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Mail: () => <div>Mail</div>,
  Phone: () => <div>Phone</div>,
  MapPin: () => <div>MapPin</div>,
  Facebook: () => <div>Facebook</div>,
  Instagram: () => <div>Instagram</div>,
}));

describe('Contact Component', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, message: 'Wiadomość wysłana' }),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Form Rendering', () => {
    it('renders all form fields', () => {
      render(<Contact />);
      
      expect(screen.getByLabelText(/Imię/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Telefon/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Wiadomość/i)).toBeInTheDocument();
    });

    it('renders submit button', () => {
      render(<Contact />);
      expect(screen.getByRole('button', { name: /Wyślij/i })).toBeInTheDocument();
    });

    it('displays contact information', () => {
      render(<Contact />);
      
      expect(screen.getByText(/kontakt@eliksir-bar.pl/i)).toBeInTheDocument();
      expect(screen.getByText(/\+48 781 024 701/i)).toBeInTheDocument();
    });
  });

  describe('Email Validation', () => {
    it('accepts valid email addresses', async () => {
      render(<Contact />);
      
      const emailInput = screen.getByLabelText(/Email/i);
      await userEvent.type(emailInput, 'test@example.com');
      
      expect(emailInput).toHaveValue('test@example.com');
      // No error message should appear
      expect(screen.queryByText(/nieprawidłowy email/i)).not.toBeInTheDocument();
    });

    it('rejects invalid email format', async () => {
      render(<Contact />);
      
      const emailInput = screen.getByLabelText(/Email/i);
      const submitButton = screen.getByRole('button', { name: /Wyślij/i });
      
      await userEvent.type(emailInput, 'invalid-email');
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/nieprawidłowy email/i)).toBeInTheDocument();
      });
    });

    it('requires email field', async () => {
      render(<Contact />);
      
      const submitButton = screen.getByRole('button', { name: /Wyślij/i });
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/email jest wymagany/i)).toBeInTheDocument();
      });
    });
  });

  describe('Phone Validation', () => {
    it('accepts valid Polish phone numbers', async () => {
      render(<Contact />);
      
      const phoneInput = screen.getByLabelText(/Telefon/i);
      await userEvent.type(phoneInput, '+48 781 024 701');
      
      expect(phoneInput).toHaveValue('+48 781 024 701');
    });

    it('accepts phone without country code', async () => {
      render(<Contact />);
      
      const phoneInput = screen.getByLabelText(/Telefon/i);
      await userEvent.type(phoneInput, '781024701');
      
      expect(phoneInput).toHaveValue('781024701');
    });

    it('rejects invalid phone format', async () => {
      render(<Contact />);
      
      const phoneInput = screen.getByLabelText(/Telefon/i);
      const submitButton = screen.getByRole('button', { name: /Wyślij/i });
      
      await userEvent.type(phoneInput, '123');
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/nieprawidłowy numer telefonu/i)).toBeInTheDocument();
      });
    });

    it('makes phone field optional', async () => {
      render(<Contact />);
      
      const nameInput = screen.getByLabelText(/Imię/i);
      const emailInput = screen.getByLabelText(/Email/i);
      const messageInput = screen.getByLabelText(/Wiadomość/i);
      
      await userEvent.type(nameInput, 'Jan Kowalski');
      await userEvent.type(emailInput, 'jan@example.com');
      await userEvent.type(messageInput, 'Witam, chciałbym zapytać o ofertę');
      
      const submitButton = screen.getByRole('button', { name: /Wyślij/i });
      await userEvent.click(submitButton);
      
      // Should not show phone error if field is empty
      expect(screen.queryByText(/telefon jest wymagany/i)).not.toBeInTheDocument();
    });
  });

  describe('Name Validation', () => {
    it('requires name field', async () => {
      render(<Contact />);
      
      const submitButton = screen.getByRole('button', { name: /Wyślij/i });
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/imię jest wymagane/i)).toBeInTheDocument();
      });
    });

    it('accepts valid names', async () => {
      render(<Contact />);
      
      const nameInput = screen.getByLabelText(/Imię/i);
      await userEvent.type(nameInput, 'Anna Nowak-Kowalska');
      
      expect(nameInput).toHaveValue('Anna Nowak-Kowalska');
    });

    it('rejects names that are too short', async () => {
      render(<Contact />);
      
      const nameInput = screen.getByLabelText(/Imię/i);
      const submitButton = screen.getByRole('button', { name: /Wyślij/i });
      
      await userEvent.type(nameInput, 'A');
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/imię musi mieć co najmniej/i)).toBeInTheDocument();
      });
    });
  });

  describe('Message Validation', () => {
    it('requires message field', async () => {
      render(<Contact />);
      
      const submitButton = screen.getByRole('button', { name: /Wyślij/i });
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/wiadomość jest wymagana/i)).toBeInTheDocument();
      });
    });

    it('accepts long messages', async () => {
      render(<Contact />);
      
      const messageInput = screen.getByLabelText(/Wiadomość/i);
      const longMessage = 'Lorem ipsum '.repeat(100);
      
      await userEvent.type(messageInput, longMessage);
      
      expect(messageInput).toHaveValue(longMessage);
    });

    it('rejects messages that are too short', async () => {
      render(<Contact />);
      
      const messageInput = screen.getByLabelText(/Wiadomość/i);
      const submitButton = screen.getByRole('button', { name: /Wyślij/i });
      
      await userEvent.type(messageInput, 'Hi');
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/wiadomość musi mieć co najmniej/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('submits form with valid data', async () => {
      render(<Contact />);
      
      const nameInput = screen.getByLabelText(/Imię/i);
      const emailInput = screen.getByLabelText(/Email/i);
      const phoneInput = screen.getByLabelText(/Telefon/i);
      const messageInput = screen.getByLabelText(/Wiadomość/i);
      
      await userEvent.type(nameInput, 'Jan Kowalski');
      await userEvent.type(emailInput, 'jan@example.com');
      await userEvent.type(phoneInput, '+48 781 024 701');
      await userEvent.type(messageInput, 'Witam, chciałbym zapytać o ofertę na wesele');
      
      const submitButton = screen.getByRole('button', { name: /Wyślij/i });
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/contact'),
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: expect.stringContaining('Jan Kowalski'),
          })
        );
      });
    });

    it('shows success message after submission', async () => {
      render(<Contact />);
      
      const nameInput = screen.getByLabelText(/Imię/i);
      const emailInput = screen.getByLabelText(/Email/i);
      const messageInput = screen.getByLabelText(/Wiadomość/i);
      
      await userEvent.type(nameInput, 'Jan Kowalski');
      await userEvent.type(emailInput, 'jan@example.com');
      await userEvent.type(messageInput, 'Test message');
      
      const submitButton = screen.getByRole('button', { name: /Wyślij/i });
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/wiadomość wysłana/i)).toBeInTheDocument();
      });
    });

    it('clears form after successful submission', async () => {
      render(<Contact />);
      
      const nameInput = screen.getByLabelText(/Imię/i) as HTMLInputElement;
      const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
      const messageInput = screen.getByLabelText(/Wiadomość/i) as HTMLTextAreaElement;
      
      await userEvent.type(nameInput, 'Jan Kowalski');
      await userEvent.type(emailInput, 'jan@example.com');
      await userEvent.type(messageInput, 'Test message');
      
      const submitButton = screen.getByRole('button', { name: /Wyślij/i });
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(nameInput.value).toBe('');
        expect(emailInput.value).toBe('');
        expect(messageInput.value).toBe('');
      });
    });

    it('handles API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      render(<Contact />);
      
      const nameInput = screen.getByLabelText(/Imię/i);
      const emailInput = screen.getByLabelText(/Email/i);
      const messageInput = screen.getByLabelText(/Wiadomość/i);
      
      await userEvent.type(nameInput, 'Jan Kowalski');
      await userEvent.type(emailInput, 'jan@example.com');
      await userEvent.type(messageInput, 'Test message');
      
      const submitButton = screen.getByRole('button', { name: /Wyślij/i });
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/błąd podczas wysyłania/i)).toBeInTheDocument();
      });
    });

    it('disables submit button during submission', async () => {
      // Mock slow API
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );
      
      render(<Contact />);
      
      const nameInput = screen.getByLabelText(/Imię/i);
      const emailInput = screen.getByLabelText(/Email/i);
      const messageInput = screen.getByLabelText(/Wiadomość/i);
      
      await userEvent.type(nameInput, 'Jan Kowalski');
      await userEvent.type(emailInput, 'jan@example.com');
      await userEvent.type(messageInput, 'Test message');
      
      const submitButton = screen.getByRole('button', { name: /Wyślij/i });
      await userEvent.click(submitButton);
      
      // Button should be disabled during submission
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Analytics Tracking', () => {
    it('tracks form submission', async () => {
      const { trackEvent } = require('../lib/error-monitoring');
      
      render(<Contact />);
      
      const nameInput = screen.getByLabelText(/Imię/i);
      const emailInput = screen.getByLabelText(/Email/i);
      const messageInput = screen.getByLabelText(/Wiadomość/i);
      
      await userEvent.type(nameInput, 'Jan Kowalski');
      await userEvent.type(emailInput, 'jan@example.com');
      await userEvent.type(messageInput, 'Test message');
      
      const submitButton = screen.getByRole('button', { name: /Wyślij/i });
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(trackEvent).toHaveBeenCalledWith(
          'contact_form_submit',
          expect.any(Object)
        );
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper label associations', () => {
      render(<Contact />);
      
      const nameInput = screen.getByLabelText(/Imię/i);
      const emailInput = screen.getByLabelText(/Email/i);
      const phoneInput = screen.getByLabelText(/Telefon/i);
      const messageInput = screen.getByLabelText(/Wiadomość/i);
      
      expect(nameInput).toHaveAttribute('id');
      expect(emailInput).toHaveAttribute('id');
      expect(phoneInput).toHaveAttribute('id');
      expect(messageInput).toHaveAttribute('id');
    });

    it('has proper ARIA attributes on submit button', () => {
      render(<Contact />);
      
      const submitButton = screen.getByRole('button', { name: /Wyślij/i });
      expect(submitButton).toHaveAttribute('type', 'submit');
    });
  });
});
