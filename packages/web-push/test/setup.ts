import { afterEach, beforeEach, vi } from 'vitest';

beforeEach(() => {
  // tell vitest we use mocked time
  vi.useFakeTimers();
});

afterEach(() => {
  // restoring date after each test run
  vi.useRealTimers();
  vi.clearAllMocks();
});
