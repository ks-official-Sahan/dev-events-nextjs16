# Test Suite for Next.js 16 Dev Events Application

Comprehensive test coverage for caching and data fetching changes.

## Test Files

1. **lib/actions/__tests__/event.actions.test.ts** - Server action tests
2. **app/__tests__/page.test.tsx** - Home page tests  
3. **app/events/__tests__/slug-page.test.tsx** - Event details page tests
4. **__tests__/config/next.config.test.ts** - Configuration validation tests

## Installation

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom @types/jest
```

## Running Tests

```bash
npm test              # Run all tests
npm test -- --watch   # Watch mode
npm test -- --coverage # With coverage
```

## Add to package.json

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/react": "^14.1.2",
    "@types/jest": "^29.5.11",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0"
  }
}
```

## Key Features Tested

- ✅ Next.js 16 caching directives (`'use cache'`, `cacheLife`)
- ✅ Server actions with `.lean()` serialization
- ✅ API integration and error handling
- ✅ Configuration validation
- ✅ Edge cases and error boundaries