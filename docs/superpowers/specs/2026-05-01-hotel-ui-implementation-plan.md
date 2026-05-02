# Hotel Reservation System - UI Implementation Plan

## Overview
Implement 6 pages following the Figma mockup design with blue-themed color palette (Navy, Royal Blue, Sky Blue), clean sans-serif typography (Inter), card-based layouts, and consistent spacing.

## Screens to Implement

### 1. Home / Search Page
- Hero image of luxury property (full-width)
- Centralized search bar (destination, dates, guests)
- Popular destinations section
- Featured hotels carousel

### 2. Search Results Page
- Hotel cards with images, ratings, prices
- Left sidebar with filters (price, rating, amenities)
- Sort options
- Pagination

### 3. Hotel Details Page
- Large image gallery (carousel)
- Hotel info section (name, rating, location)
- Room types listing with prices
- Amenities list
- Booking calendar
- Map integration

### 4. Booking & Payment Page
- Split-screen layout
- Left: Booking summary
- Right: Guest info + payment form
- Order total breakdown

### 5. Hotel Admin Dashboard
- Left sidebar navigation
- Top statistical cards (revenue, occupancy)
- Bar charts and donut charts
- Recent activity feed

### 6. System Admin Verification Page
- Verification queue list
- Approve/Reject buttons (green/red)
- Hotel details preview
- Filter tabs (pending, approved, rejected)

## Color Palette
- Primary: #1E3A5F (Navy Blue)
- Secondary: #3B82F6 (Royal Blue)
- Accent: #0EA5E9 (Sky Blue)
- Success: #22C55E (Green)
- Error: #EF4444 (Red)
- Warning: #F59E0B (Orange/Yellow for stars)
- Background: #FFFFFF (White)
- Text Primary: #1E293B (Slate)
- Text Secondary: #64748B (Gray)
- Border: #E2E8F0 (Light Gray)

## Typography
- Font Family: Inter (Google Fonts)
- Headings: Bold, Navy Blue
- Body: Regular, Slate Gray
- Labels: Light weight or all-caps

## Components
- Buttons: Rounded corners, primary (solid blue), secondary (outline)
- Cards: Subtle borders, white background
- Form inputs: Light gray outlines, focus states
- Icons: Minimalist line icons

## Tech Stack
- React 18 + TypeScript
- Tailwind CSS
- Recharts for charts
- Lucide React for icons
- date-fns for date handling

## Execution Order
1. Home/Search (customer-facing entry point)
2. Search Results
3. Hotel Details
4. Booking & Payment
5. Hotel Admin Dashboard
6. System Admin Verification

Each screen will be implemented as a separate task with sub-agent support.