import * as migration_20260516_020528 from './20260516_020528';
import * as migration_20260516_021716 from './20260516_021716';

export const migrations = [
  {
    up: migration_20260516_020528.up,
    down: migration_20260516_020528.down,
    name: '20260516_020528',
  },
  {
    up: migration_20260516_021716.up,
    down: migration_20260516_021716.down,
    name: '20260516_021716'
  },
];
