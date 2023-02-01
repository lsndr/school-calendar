import { ClientsService } from './clients.service';
import { Test } from '@nestjs/testing';
import { Office, OfficeId, TimeZone } from '../../domain';
import { DateTime } from 'luxon';
import { MikroORM } from '@mikro-orm/postgresql';
import { testMikroormProvider } from '../../../../../test-utils';
import { CreateClientDto } from './create-client.dto';

describe('Clients Service', () => {
  let clientsService: ClientsService;
  let office: Office;
  let orm: MikroORM;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [],
      providers: [ClientsService, testMikroormProvider],
    }).compile();

    clientsService = moduleRef.get(ClientsService);
    orm = moduleRef.get(MikroORM);
  });

  beforeEach(async () => {
    office = Office.create({
      id: OfficeId.create(),
      name: 'Test Office',
      timeZone: TimeZone.create('Europe/Moscow'),
      now: DateTime.now(),
    });

    const officeRepository = orm.em.fork();
    await officeRepository.persistAndFlush(office);
  });

  it('should create a client', async () => {
    const result = await clientsService.create({
      name: 'Test Client',
      officeId: office.id.value,
    });

    const result2 = await clientsService.findOne(result.id);

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

  afterAll(async () => {
    await orm.close();
  });
});
