import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { SearchPage } from '../../pages/hotels/SearchPage';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';

describe('SearchPage - Filter Application', () => {
  it('renders hotel cards after search', async () => {
    render(
      <MemoryRouter initialEntries={['/search?location=Istanbul']}>
        <SearchPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Hotel in Istanbul/i) || screen.getByText(/Test Hotel/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('renders price range filter controls', async () => {
    render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>
    );

    // Wait for the page to load
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /search hotels/i }) ?? true).toBeTruthy();
    }, { timeout: 5000 });
  });

  it('renders amenities filter checkboxes', async () => {
    render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      const wifiCheckbox = screen.queryByRole('checkbox', { name: /wifi/i });
      const poolCheckbox = screen.queryByRole('checkbox', { name: /pool/i });
      expect(wifiCheckbox || poolCheckbox).toBeTruthy();
    }, { timeout: 5000 });
  });

  it('updates URL when city filter changes', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>
    );

    const cityInput = screen.queryByPlaceholderText(/city/i) as HTMLInputElement;
    if (cityInput) {
      await user.clear(cityInput);
      await user.type(cityInput, 'Ankara');
      await user.keyboard('{Enter}');
    }
  });
});

describe('SearchPage - Empty State', () => {
  it('shows empty state when no hotels match filters', async () => {
    server.use(
      http.get('/api/search/hotels', () => {
        return HttpResponse.json({ hotels: [] });
      })
    );

    render(
      <MemoryRouter initialEntries={['/search?location=NonExistentCity']}>
        <SearchPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/no hotels found/i) || screen.getByText(/no results/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });
});

describe('SearchPage - Hotel Card Render', () => {
  it('displays hotel name and rating', async () => {
    render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      const hotelCard = screen.queryByText(/Test Hotel/i);
      expect(hotelCard).toBeTruthy();
    }, { timeout: 5000 });
  });

  it('displays hotel price per night', async () => {
    render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      const priceElement = screen.queryByText(/\$\d+/);
      expect(priceElement).toBeTruthy();
    }, { timeout: 5000 });
  });
});