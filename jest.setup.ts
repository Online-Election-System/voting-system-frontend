import '@testing-library/jest-dom';

// Mock Next.js app-router hooks used in components
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), refresh: jest.fn() }),
}));

// Silence jsdom navigation errors BEFORE creating location mock
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  if (
    typeof args[0] === 'object' && 
    args[0]?.message?.includes('Not implemented: navigation')
  ) {
    return; // Suppress navigation errors
  }
  if (
    typeof args[0] === 'string' && 
    args[0].includes('Not implemented: navigation')
  ) {
    return; // Suppress navigation errors
  }
  originalConsoleError(...args);
};

// Create a complete mock of window.location that doesn't trigger jsdom navigation
const mockLocation = {
  href: 'http://localhost:3000',
  origin: 'http://localhost:3000',
  protocol: 'http:',
  host: 'localhost:3000',
  hostname: 'localhost',
  port: '3000',
  pathname: '/',
  search: '',
  hash: '',
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
  toString: jest.fn(() => 'http://localhost:3000'),
};

// Force delete and recreate location
delete (window as any).location;
(window as any).location = mockLocation;

// Mock localStorage globally
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Reset mocks before each test
beforeEach(() => {
  localStorageMock.getItem.mockReturnValue(null);
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  
  // Reset location mock
  mockLocation.assign.mockClear();
  mockLocation.replace.mockClear();
  mockLocation.reload.mockClear();
});