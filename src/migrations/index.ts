import * as migration_20260516_020528 from './20260516_020528';

export const migrations = [
  {
    up: migration_20260516_020528.up,
    down: migration_20260516_020528.down,
    name: '20260516_020528'
  },
];
