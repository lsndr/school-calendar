import { ClientsService } from './clients.service';
import { Test } from '@nestjs/testing';
import { Office, OfficeId, TimeZone } from '../../domain';
import { DateTime } from 'luxon';
import { MikroORM } from '@mikro-orm/postgresql';
import { testMikroormProvider } from '../../../../../test-utils';
import { CreateClientDto } from './create-client.dto';

describe('Clients Service', () => {
  let clientsService: ClientsService;
  let orm: MikroORM;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [],
      providers: [ClientsService, testMikroormProvider],
    }).compile();

    clientsService = moduleRef.get(ClientsService);
    orm = moduleRef.get(MikroORM);
  });

  it('should create a client', async () => {
    const office = await seedOffice(orm);

    const result = await clientsService.create({
      name: 'Test Client',
      officeId: office.id.value,
    });

    const result2 = await clientsService.findOne(office.id.value, result.id);

    expect(result).toEqual(result2);
    expect(result).toEqual({
      id: expect.any(String),
      name: 'Test Client',
    });
  });

  it('should fail to create a client if office not found', async () => {
    const result = () =>
      clientsService.create(
        new CreateClientDto({
          name: 'Test Client',
          officeId: 'wrong-office-id',
        }),
      );

    await expect(result).rejects.toThrowError('Office not found');
  });

  it('should fail to create a client if office not found', async () => {
    const result = () =>
      clientsService.create(
        new CreateClientDto({
          name: 'Test Client',
          officeId: 'wrong-office-id',
        }),
      );

    await expect(result).rejects.toThrowError('Office not found');
  });

  it('should find clients', async () => {
    const office1 = await seedOffice(orm);
    const office2 = await seedOffice(orm);

    await clientsService.create({
      name: 'Client 11',
      officeId: office1.id.value,
    });
    await clientsService.create({
      name: 'Client 12',
      officeId: office1.id.value,
    });
    await clientsService.create({
      name: 'Client 21',
      officeId: office2.id.value,
    });

    const result = await clientsService.findMany(office1.id.value);

    expect(result).toEqual([
      {
        id: expect.any(String),
        name: 'Client 11',
      },
      {
        id: expect.any(String),
        name: 'Client 12',
      },
    ]);
  });

  afterEach(async () => {
    await orm.close();
  });
});

async function seedOffice(orm: MikroORM) {
  const office = Office.create({
    id: OfficeId.create(),
    name: 'Test Office',
    timeZone: TimeZone.create('Europe/Moscow'),
    now: DateTime.now(),
  });

  const officeRepository = orm.em.fork();
  await officeRepository.persistAndFlush(office);

  return office;
}
