import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const configDirectory = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({
  path: path.resolve(configDirectory, '../.env'),
});
