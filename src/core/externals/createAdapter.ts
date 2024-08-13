import type {
  PathCommon,
  FileSystemCommon,
  StoreCommon,
  CommandCommon,
} from './types/index.js';

export type AdapterCommon =
  | PathCommon
  | FileSystemCommon
  | StoreCommon
  | CommandCommon;

export const AdapterType = {
  Path: 'path',
  FileSystem: 'fs',
  Store: 'store',
  Command: 'command',
} as const;

export type AdapterType = (typeof AdapterType)[keyof typeof AdapterType];

export type Config<ConfigType extends AdapterType> =
  ConfigType extends (typeof AdapterType)['Path']
    ? PathCommon
    : ConfigType extends (typeof AdapterType)['FileSystem']
    ? FileSystemCommon
    : ConfigType extends (typeof AdapterType)['Store']
    ? StoreCommon
    : ConfigType extends (typeof AdapterType)['Command']
    ? CommandCommon
    : never;

export function createAdapter<ConfigType extends AdapterType>(
  type: ConfigType,
  config: Config<ConfigType>
): Config<ConfigType> {
  for (const key in config) {
    if (config[key] === undefined) {
      throw new Error(`[${type}] Missing required config value: ${key}`);
    }
  }

  return config;
}

export function createPathAdapter(config: PathCommon): PathCommon {
  return createAdapter(AdapterType.Path, config);
}

export function createFileSystemAdapter(
  config: FileSystemCommon
): FileSystemCommon {
  return createAdapter(AdapterType.FileSystem, config);
}

export function createStoreAdapter(config: StoreCommon): StoreCommon {
  return createAdapter(AdapterType.Store, config);
}

export function createCommandAdapter(config: CommandCommon): CommandCommon {
  return createAdapter(AdapterType.Command, config);
}
