import { OfficesService } from './offices.service';
import { Test } from '@nestjs/testing';
import { testMikroormProvider } from '../../../../../test-utils';
import { MikroORM } from '@mikro-orm/postgresql';
import { CreateOfficeDto } from './create-office.dto';
import { Office, OfficeId, TimeZone } from '../../domain';
import { DateTime } from 'luxon';

describe('Offices Service', () => {
  let officesService: OfficesService;
  let orm: MikroORM;

  beforeEach(async () => {
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

  it('should find offices', async () => {
    await seed(orm);

    const result = await officesService.findMany();

    expect(result).toEqual([
      {
        id: expect.any(String),
        name: 'Office 1',
        timeZone: 'Europe/Moscow',
      },
      {
        id: expect.any(String),
        name: 'Office 2',
        timeZone: 'Europe/London',
      },
    ]);
  });

  afterEach(async () => {
    await orm.close();
  });
});

async function seed(orm: MikroORM) {
  const em = orm.em.fork();

  const office1 = Office.create({
    id: OfficeId.create(),
    name: 'Office 1',
    timeZone: TimeZone.create('Europe/Moscow'),
    now: DateTime.fromISO('2023-02-05T19:48:34', {
      zone: 'Europe/Moscow',
    }),
  });

  const office2 = Office.create({
    id: OfficeId.create(),
    name: 'Office 2',
    timeZone: TimeZone.create('Europe/London'),
    now: DateTime.fromISO('2023-02-07T10:12:56', {
      zone: 'Europe/London',
    }),
  });

  await em.persistAndFlush([office1, office2]);

  return {
    office1,
    office2,
  };
}
