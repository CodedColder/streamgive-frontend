import React, { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { StreamDetailsModal } from './StreamDetailsModal';
import type { Stream } from '@/lib/api';

const mockStream: Stream = {
  id: '123',
  onChainId: '456',
  tokenAddress: 'token-address',
  rate: '1000',
  balance: '5000',
  withdrawn: '0',
  status: 'ACTIVE',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  donor: { address: 'donor-address' },
  ngo: { id: 'ngo-id', name: 'Test NGO', ownerAddress: 'ngo-owner' }
};

function TestWrapper() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <button data-testid="trigger" onClick={() => setIsOpen(true)}>Open Modal</button>
      {isOpen && <StreamDetailsModal stream={mockStream} onClose={() => setIsOpen(false)} />}
    </div>
  );
}

test('StreamDetailsModal closes on Escape and restores focus to triggering element', async () => {
  const user = userEvent.setup();
  render(<TestWrapper />);
  
  const triggerButton = screen.getByTestId('trigger');
  
  // Focus and click the trigger button
  triggerButton.focus();
  expect(triggerButton).toHaveFocus();
  await user.click(triggerButton);
  
  // Modal should open, and close button should receive focus
  const closeButton = await screen.findByRole('button', { name: 'Close' });
  expect(closeButton).toBeInTheDocument();
  
  // Ensure the close button got focus
  await waitFor(() => {
    expect(closeButton).toHaveFocus();
  });
  
  // Press Escape
  await user.keyboard('{Escape}');
  
  // Modal should close
  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  
  // Focus should return to trigger button
  expect(triggerButton).toHaveFocus();
});
