const request = require('supertest');
const app = require('../app');
const { expect } = require('chai');

let token;

before(async () => {
  const response = await request(app)
    .post('/users/register')
    .send({ name: 'testuser',email:'admin21s@gmail.com', password: 'testpassword', role: 'SalesAgent' });
    expect(response.status).to.equal(201);

   const loginResponse = await request(app)
    .post('/users/login')
    .send({ email:'admin21s@gmail.com', password: 'testpassword' });
    expect(loginResponse.status).to.equal(200);

  expect(loginResponse.body.token).to.be.a('string');
  token = loginResponse.body.token;
});


describe('POST /leads', () => { 
  it('should create a new lead', async () => {
    const newLead = { 
      name: 'John Doe', 
      email: 'afJohsnsoe2@mail.com', 
      phone: '1234567890',
      source: 'Website' ,
      status:'Assigned'
    };

    const res = await request(app)
      .post('/leads')    
      .set('Authorization', `Bearer ${token}`)
      .send(newLead)
      .expect(201);
    
    expect(res.body.name).to.equal(newLead.name);
    expect(res.body.email).to.equal(newLead.email);
    expect(res.body.phone).to.equal(newLead.phone);
    expect(res.body.source).to.equal(newLead.source);
    expect(res.body.status).to.equal(newLead.status);
  });
});


describe('PUT /leads/assign/:id', () => {
  it('should return forbidden for non-admin user', async () => {
    const createRes = await request(app)
      .post('/leads')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Lead', email: 'testUser3@example.com', phone: '111111', source: 'Website', status: 'Unassigned' })
      .expect(201);
    const leadId = createRes.body.id;  
    const res = await request(app)
      .put(`/leads/assign/${leadId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ agentId: '1' })
      .expect(403);

    expect(res.body.message).to.equal('Forbidden');
  });

  it('should assign lead for admin user', async () => {
    const createRes = await request(app)
      .post('/leads')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Admin Lead', email: 'testuser4@example.com', phone: '222222', source: 'Website', status: 'Unassigned' })
      .expect(201);
    const leadId = createRes.body.id;

    const res = await request(app)
      .put(`/leads/assign/${leadId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ assignedAgentId: 2 })
      .expect(200);

    expect(res.body.message).to.equal('Lead assigned');
  });


});


describe('PUT /leads/progress/:id', () => {
  it('should update lead status', async () => {    
    const createRes = await request(app)
      .post('/leads')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Progress Lead', email: 'progress1s@example.com', phone: '333333', source: 'Website', status: 'Unassigned' })
      .expect(201);
    const leadId = createRes.body.id;
 
    const res = await request(app)
      .put(`/leads/progress/${leadId}`)     
      .send({ status: 'Assigned' })
      .expect(200);

    expect(res.body.message).to.equal('Lead updated');
  });
});

describe('DELETE /leads/cancel/:id', () => {
  it('should return 400 if lead status is not reservation', async () => {   
    const createRes = await request(app)
      .post('/leads')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Cancel Lead', email: 'cancel@example.com', phone: '444444', source: 'Website', status: 'Assigned' })
      .expect(201);
    const leadId = createRes.body.id;

    const res = await request(app)
      .delete(`/leads/cancel/${leadId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ reason: 'Not interested' })
      .expect(400);

    expect(res.body.message).to.equal('Cancellation allowed only in reservation stage');
  });

  it('should cancel lead if status is reservation', async () => {    
    const createRes = await request(app)
      .post('/leads')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Reservation Lead', email: 'reservation@example.com', phone: '555555', source: 'Website', status: 'Reserved' })
      .expect(201);
    const leadId = createRes.body.id;

    const res = await request(app)
      .delete(`/leads/cancel/${leadId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ reason: 'Changed mind' })
      .expect(200);

    expect(res.body.message).to.equal('Lead cancelled');
    expect(res.body.reason).to.equal('Changed mind');
  });
});

describe('GET /leads', () => {

  it('should filter leads by status', async () => {
    const res = await request(app)
      .get('/leads')
      .query({ status: 'Assigned' })
      .expect(200);

    res.body.forEach((lead) => {
      expect(lead.status).to.equal('Assigned');
    });
  });


  
  it('should filter leads by agentId', async () => {
    const res = await request(app)
      .get('/leads')
      .query({ assignedAgentId: 1 })
      .expect(200);

    res.body.forEach((lead) => {
      expect(lead.assignedAgentId).to.equal(1);
    });
  });

  it('should filter leads by startDate and endDate', async () => {
    const res = await request(app)
      .get('/leads')
      .query({ createdAt: '2025-01-01', createdAt: '2025-02-30' })
      .expect(200);

    res.body.forEach((lead) => {
      const createdAt = new Date(lead.createdAt);
      expect(createdAt >= new Date('2025-01-01')).to.be.true;
      expect(createdAt <= new Date('2025-02-30')).to.be.true;
    });
  });


  it('should filter leads by startDate only', async () => {
    const res = await request(app)
      .get('/leads')
      .query({ createdAt: '2025-01-01' })
      .expect(200);

    res.body.forEach((lead) => {
      const createdAt = new Date(lead.createdAt);
      expect(createdAt >= new Date('2025-01-01')).to.be.true;
    });
  });

  it('should filter leads by endDate only', async () => {
    const res = await request(app)
      .get('/leads')
      .query({ createdAt: '2025-03-01' })
      .expect(200);

    res.body.forEach((lead) => {
      const createdAt = new Date(lead.createdAt);
      expect(createdAt <= new Date('2025-03-01')).to.be.true;
    });
  });

  it('should return all leads if no query is provided', async () => {
    const res = await request(app)
      .get('/leads')
      .expect(200);

    expect(res.body).to.be.an('array');
  });


});
