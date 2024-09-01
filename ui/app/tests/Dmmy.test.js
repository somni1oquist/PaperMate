// ui/app/tests/Dummy.test.js
import { render, screen } from '@testing-library/react';
import React from 'react';

// Dummy component for testing
function DummyComponent() {
  return <div>Hello, world!</div>;
}

test('renders hello world message', () => {
  render(<DummyComponent />);
  const textElement = screen.getByText(/hello, world!/i);
  expect(textElement).toBeInTheDocument();
});
