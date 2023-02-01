import { SchoolsService } from './schools.service';
import { Test } from '@nestjs/testing';
import { testMikroormProvider } from '../../../../../test-utils';
import { MikroORM } from '@mikro-orm/postgresql';

describe('Schools Service', () => {
  let schoolsService: SchoolsService;
  let orm: MikroORM;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [],
      providers: [SchoolsService, testMikroormProvider],
    }).compile();

    schoolsService = moduleRef.get(SchoolsService);
    orm = moduleRef.get(MikroORM);
  });

  it('should create an school', async () => {
    const result = await schoolsService.create({
      name: 'Test School',
      timeZone: 'Europe/Moscow',
    });

    const result2 = await schoolsService.findOne(result.id);

    expect(result).toEqual(result2);
    expect(result).toEqual({
      id: expect.any(String),
      name: 'Test School',
      timeZone: 'Europe/Moscow',
    });
  });

  afterAll(async () => {
    await orm.close();
  });
});
