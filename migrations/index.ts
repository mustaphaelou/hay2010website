import * as migration_20261126_214945_initial_cms_content_types from './20261126_214945_initial_cms_content_types';

export const migrations = [
  {
    up: migration_20261126_214945_initial_cms_content_types.up,
    down: migration_20261126_214945_initial_cms_content_types.down,
    name: '20261126_214945_initial_cms_content_types'
  },
];
