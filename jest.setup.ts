import { config } from 'dotenv';
import { resolve } from 'path';

export default () => {
  config({
    path: resolve(__dirname, '.env.test'),
  });
};
