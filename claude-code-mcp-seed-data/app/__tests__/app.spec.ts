import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/vue';
import App from '~/app.vue';

// Mock NuxtPage component
const NuxtPageMock = {
  name: 'NuxtPage',
  template: '<div data-testid="nuxt-page">Mocked NuxtPage</div>'
};

vi.stubGlobal('NuxtPage', NuxtPageMock);

describe('App.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without errors', () => {
      const { container } = render(App, {
        global: {
          stubs: {
            NuxtPage: NuxtPageMock
          }
        }
      });

      expect(container).toBeTruthy();
    });

    it('should render NuxtPage component', () => {
      const { getByTestId } = render(App, {
        global: {
          stubs: {
            NuxtPage: NuxtPageMock
          }
        }
      });

      expect(getByTestId('nuxt-page')).toBeDefined();
    });
  });
});
