---
description: Generate comprehensive unit tests for the specified code
argument-hint: [file or function]
---

Create comprehensive unit tests for: $ARGUMENTS

Requirements:

- Use vitest and @testing-library/vue
- Test all major functionality
- Include edge cases and error scenarios
- Mock external dependencies, prefer using vi.spyon over vi.mock or vi.mocked.
- For Datetime sensitive scenario, do mock datetime using vi.setSystemTime.
- Aim for high code coverage
