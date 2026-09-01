/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmptyState } from '@/components/ui/empty-state';

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState title="No items yet" description="Add the first record." />);
    expect(screen.getByText('No items yet')).toBeTruthy();
    expect(screen.getByText('Add the first record.')).toBeTruthy();
  });
});
