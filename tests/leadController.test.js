const request = require('supertest');
const app = require('../server');

describe('Lead Controller', () => {
  it('should create a new lead', async () => {
    const response = await request(app)
      .post('/leads')
      .send({
        name: 'John Doe',
        contact: 'john.doe@example.com',
        source: 'website',
      });
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
  });

 
});
