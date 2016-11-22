import path from 'path';
import { v4 } from 'uuid';

export const testDir = path.resolve(__dirname, '..', '.tmp/test');
export const getTmpDir = () => path.resolve(testDir, v4());