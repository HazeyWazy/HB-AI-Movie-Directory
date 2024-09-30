import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import dotenv from 'dotenv';
import app from './server.js';

dotenv.config(); // Load environment variables from .env file

let server;

beforeAll(() => {
  return new Promise((resolve) => {
    server = app.listen(0, () => {
      resolve();
    });
  });
});

afterAll((done) => {
  server.close(done);
});

describe('API Endpoints', () => {
  it('GET /api/search should return 200', async () => {
    const response = await request(app).get('/api/search?title=inception');
    if (response.status !== 200) {
      console.error('Response body:', response.body);
    }
    expect(response.status).toBe(200);
    expect(response.body.Search).toBeDefined();
  });

  it('GET /api/movie/:id should return 200', async () => {
    const response = await request(app).get('/api/movie/tt1375666');
    if (response.status !== 200) {
      console.error('Response body:', response.body);
    }
    expect(response.status).toBe(200);
    expect(response.body.Title).toBe('Inception');
  });
});