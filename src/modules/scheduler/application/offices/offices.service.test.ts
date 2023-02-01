import { OfficesService } from './offices.service';
import { Test } from '@nestjs/testing';
import { MIKROORM_PROVIDER } from '../../../shared/database';
import { testMikroormProvider } from '../../../../../test-utils';
import { MikroORM } from '@mikro-orm/postgresql';

describe('Offices Service', () => {
  let officesService: OfficesService;
  let orm: MikroORM;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [],
      providers: [OfficesService, testMikroormProvider],
    }).compile();

    officesService = moduleRef.get(OfficesService);
    orm = moduleRef.get(MIKROORM_PROVIDER);
  });

  it('should create an office', async () => {
    const result = await officesService.create({
      name: 'Test Office',
      timeZone: 'Europe/Moscow',
    });

    const result2 = await officesService.findOne(result.id);

    expect(result).toEqual(result2);
    expect(result).toEqual({
      id: expect.any(String),
      name: 'Test Office',
      timeZone: 'Europe/Moscow',
    });
  });

  afterAll(async () => {
    await orm.close();
  });
});
