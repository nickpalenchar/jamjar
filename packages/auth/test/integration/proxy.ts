import { start, stop } from '../../src/index';
import { PrismaClient } from '@prisma/client';
import { add } from 'date-fns';
const prisma = new PrismaClient();

const USER_ID = 'test-user-123';
const SESSION_ID = 'test-session-456';

describe('proxy requests', () => {
  let user;
  let session;
  beforeAll(start);

  beforeEach(async () => {
    user = await prisma.user.create({
      data: {
        id: 'test-123',
        email: 'user1@example.com',
        anon: false,
      }
    });
    session = await prisma.session.create({
      data: {
        userId: user.id,
        exp: add(Date.now(), { days: 2 }),
      }
    });
  })
  afterAll(async () => {
    await stop();
  });

  it('Sets the auth header when theres a valid session', async () => {
    
  });
})