/* eslint-disable import/no-default-export -- Required by jest */

import { config } from 'dotenv';
import { resolve } from 'path';

export default () => {
  config({
    path: resolve(__dirname, '.env.test'),
  });
};
