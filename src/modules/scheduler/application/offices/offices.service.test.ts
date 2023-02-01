import { OfficesService } from './offices.service';
import { Test } from '@nestjs/testing';
import { testMikroormProvider } from '../../../../../test-utils';
import { MikroORM } from '@mikro-orm/postgresql';
import { CreateOfficeDto } from './create-office.dto';

describe('Offices Service', () => {
  let officesService: OfficesService;
  let orm: MikroORM;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [],
      providers: [OfficesService, testMikroormProvider],
    }).compile();

    officesService = moduleRef.get(OfficesService);
    orm = moduleRef.get(MikroORM);
  });

  it('should create an office', async () => {
    const result = await officesService.create(
      new CreateOfficeDto({
        name: 'Test Office',
        timeZone: 'Europe/Moscow',
      }),
    );

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
