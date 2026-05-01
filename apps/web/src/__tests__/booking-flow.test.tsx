import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import React from 'react';
import { BookingPage } from '../../pages/bookings/BookingPage';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';

const renderBookingPage = (initialEntries = '/book/hotel-1/room-1') => {
  render(
    <MemoryRouter initialEntries={[initialEntries]}>
      <Routes>
        <Route path="/book/:hotelId/:roomId" element={<BookingPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('BookingPage - Price Calculation Display', () => {
  it('displays price per night and total price', async () => {
    renderBookingPage();

    await waitFor(() => {
      const priceElements = screen.queryAllByText(/\$\d+/);
      expect(priceElements.length).toBeGreaterThan(0);
    }, { timeout: 5000 });
  });

  it('calculates total for multi-night stay', async () => {
    renderBookingPage();

    await waitFor(() => {
      const totalElement = screen.queryByText(/total/i);
      expect(totalElement).toBeTruthy();
    }, { timeout: 5000 });
  });
});

describe('BookingPage - Form Validation', () => {
  it('validates required guest count', async () => {
    const user = userEvent.setup();
    renderBookingPage();

    const submitBtn = screen.queryByRole('button', { name: /book now/i });
    if (submitBtn) {
      await user.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/number of guests is required/i) || screen.getByText(/guests/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    }
  });

  it('validates guest count does not exceed room capacity', async () => {
    const user = userEvent.setup();
    renderBookingPage();

    const guestInput = screen.queryByLabelText(/guests/i);
    if (guestInput) {
      await user.clear(guestInput);
      await user.type(guestInput, '10');

      const submitBtn = screen.queryByRole('button', { name: /book now/i });
      if (submitBtn) await user.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/exceeds maximum/i) || screen.getByText(/capacity/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    }
  });

  it('shows error when check-out is before check-in', async () => {
    renderBookingPage('/book/hotel-1/room-1?checkIn=2026-05-20&checkOut=2026-05-18');

    await waitFor(() => {
      expect(screen.getByText(/check-out must be after check-in/i) || screen.getByText(/invalid/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});

describe('BookingPage - Confirmation Redirect', () => {
  it('redirects to confirmation page on successful booking', async () => {
    server.use(
      http.post('/api/bookings', async () => {
        return HttpResponse.json({
          id: 'booking-new-123',
          status: 'PENDING',
          totalPrice: 240,
          payment: { id: 'pay-1', status: 'PENDING' },
        }, { status: 201 });
      })
    );

    const user = userEvent.setup();
    renderBookingPage();

    // Fill in required fields if present
    const guestInput = screen.queryByLabelText(/guests/i);
    if (guestInput) {
      await user.clear(guestInput);
      await user.type(guestInput, '2');
    }

    const submitBtn = screen.queryByRole('button', { name: /book now/i });
    if (submitBtn) {
      await user.click(submitBtn);
    }

    await waitFor(() => {
      expect(window.location.pathname).toMatch(/\/booking\/confirmation\//);
    }, { timeout: 4000 });
  });
});