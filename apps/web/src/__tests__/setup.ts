import { afterAll, beforeAll, afterEach } from 'vitest';
import { worker } from './mocks/browser';

beforeAll(() => worker.start({ onUnhandledRequest: 'bypass' }));
afterEach(() => worker.resetHandlers());
afterAll(() => worker.stop());