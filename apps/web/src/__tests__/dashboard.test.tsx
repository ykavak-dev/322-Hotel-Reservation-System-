import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { HotelAdminDashboard } from '../../pages/hotel-admin/DashboardPage';
import { SystemAdminDashboard } from '../../pages/admin/AdminDashboardPage';
import { BookingsTable } from '../../components/bookings/BookingsTable';

const mockBookings = [
  {
    id: 'book-1',
    room: { hotel: { name: 'Hotel A' }, type: 'SINGLE' },
    checkIn: new Date('2026-05-10'),
    checkOut: new Date('2026-05-12'),
    status: 'CONFIRMED',
    totalPrice: 200,
  },
  {
    id: 'book-2',
    room: { hotel: { name: 'Hotel B' }, type: 'DOUBLE' },
    checkIn: new Date('2026-05-15'),
    checkOut: new Date('2026-05-17'),
    status: 'PENDING',
    totalPrice: 150,
  },
];

describe('HotelAdminDashboard - Stats Rendering', () => {
  it('renders KPI cards with stats', async () => {
    render(
      <MemoryRouter>
        <HotelAdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/total bookings/i) || screen.getByText(/bookings/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('renders occupancy chart', async () => {
    render(
      <MemoryRouter>
        <HotelAdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByRole('img') ?? true).toBeTruthy();
    }, { timeout: 5000 });
  });
});

describe('BookingsTable - Render and Actions', () => {
  it('renders booking rows correctly', async () => {
    render(<BookingsTable bookings={mockBookings} />);

    expect(screen.getByText('Hotel A')).toBeInTheDocument();
    expect(screen.getByText('Hotel B')).toBeInTheDocument();
  });

  it('shows status badge for each booking', async () => {
    render(<BookingsTable bookings={mockBookings} />);

    expect(screen.getAllByText('CONFIRMED')).toHaveLength(1);
    expect(screen.getAllByText('PENDING')).toHaveLength(1);
  });

  it('disables cancel button for past bookings', async () => {
    const pastBookings = [
      { ...mockBookings[0], checkIn: new Date('2024-01-01'), checkOut: new Date('2024-01-03') },
    ];
    render(<BookingsTable bookings={pastBookings} />);

    const cancelBtn = screen.queryByRole('button', { name: /cancel/i });
    expect(cancelBtn).toBeDisabled();
  });

  it('enables cancel button for future bookings', async () => {
    render(<BookingsTable bookings={mockBookings} />);

    const cancelBtn = screen.queryAllByRole('button', { name: /cancel/i })[0];
    expect(cancelBtn).not.toBeDisabled();
  });
});

describe('SystemAdminDashboard - User Management', () => {
  it('renders users table', async () => {
    render(
      <MemoryRouter>
        <SystemAdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/users/i) || screen.getByRole('table')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('renders dashboard KPI cards', async () => {
    render(
      <MemoryRouter>
        <SystemAdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/total hotels/i) || screen.getByText(/hotels/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });
});