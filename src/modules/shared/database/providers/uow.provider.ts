import { uowFactory } from 'yuow';
import { KNEX_PROVIDER } from './knex.provider';
import { Provider } from '@nestjs/common';

export const UOW_PROVIDER = Symbol.for('UOW_PROVIDER');

export const uowProvider: Provider = {
  provide: UOW_PROVIDER,
  useFactory: uowFactory,
  inject: [KNEX_PROVIDER],
};
