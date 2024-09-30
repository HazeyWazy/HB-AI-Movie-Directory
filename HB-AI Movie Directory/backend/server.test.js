// backend/server.test.js
import { describe, it, expect } from 'vitest';
import supertest from 'supertest';
import app from './server';

const request = supertest(app);

describe('API Endpoints', () => {
  it('GET /api/search should return 200', async () => {
    const response = await request.get('/api/search?title=inception');
    expect(response.status).toBe(200);
    expect(response.body.Search).toBeDefined();
  });

  it('GET /api/movie/:id should return 200', async () => {
    const response = await request.get('/api/movie/tt1375666');
    expect(response.status).toBe(200);
    expect(response.body.Title).toBe('Inception');
  });
});