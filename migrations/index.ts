import * as migration_20261126_203240_initial from './20261126_203240_initial';

export const migrations = [
  {
    up: migration_20261126_203240_initial.up,
    down: migration_20261126_203240_initial.down,
    name: '20261126_203240_initial'
  },
];
