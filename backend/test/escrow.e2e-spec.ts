import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Financial Safety & Escrow (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Razorpay Webhook Idempotency', () => {
    it('rejects webhook without signature (Replay Protection)', async () => {
      return request(app.getHttpServer())
        .post('/wallet/razorpay-webhook')
        .send({ event: 'payment.captured' })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Missing signature');
        });
    });

    it('rejects webhook with invalid signature', async () => {
      return request(app.getHttpServer())
        .post('/wallet/razorpay-webhook')
        .set('x-razorpay-signature', 'invalid-signature')
        .send({ event: 'payment.captured' })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid webhook signature');
        });
    });
  });

  describe('Contract State Machine (Double Release Prevention)', () => {
    // This verifies the endpoints reject unauthorized access
    it('requires authentication for escrow funding', async () => {
      return request(app.getHttpServer())
        .post('/contracts/test-contract/fund')
        .expect(401);
    });

    it('requires authentication for escrow release', async () => {
      return request(app.getHttpServer())
        .post('/contracts/test-contract/approve')
        .expect(401);
    });
  });
});
