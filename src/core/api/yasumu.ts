import {
  YasumuWorkspace,
  type YasumuWorkspaceHistory,
} from './workspace/YasumuWorkspace.js';
import { YasumuWorkspaceFiles } from './workspace/constants.js';
import { Commands } from '../common/commands.js';
import type {
  StoreCommon,
  FileSystemCommon,
  PathCommon,
  CommandCommon,
  DialogCommon,
  ProcessCommon,
  ApplicationCommon,
  EventsCommon,
} from '../../externals/types/index.js';
import type { FetchCommon } from '../../externals/types/fetch.js';
import type { ScriptsCommon } from '@/scripts/types.js';
import { YasumuScripts } from '@/scripts/YasumuScripts.js';
import type { ShellCommon } from '@/externals/types/shell.js';

export class YasumuCore {
  public readonly scripts: YasumuScripts;
  public readonly store: StoreCommon;
  public readonly commands: CommandCommon;
  public readonly fs: FileSystemCommon;
  public readonly path: PathCommon;
  public readonly fetch: FetchCommon;
  public readonly dialog: DialogCommon;
  public readonly process: ProcessCommon;
  public readonly app: ApplicationCommon;
  public readonly events: EventsCommon;
  public readonly createStore: YasumuCreate<[string], StoreCommon>;
  public workspace: YasumuWorkspace | null = null;

  public constructor(config: YasumuCoreConfiguration) {
    this.createStore = config.createStore;
    this.store = config.createStore(YasumuWorkspaceFiles.StorePath);
    this.commands = config.commands;
    this.fs = config.fs;
    this.path = config.path;
    this.fetch = config.fetch;
    this.dialog = config.dialog;
    this.process = config.process;
    this.app = config.app;
    this.events = config.events;
    this.scripts = new YasumuScripts(this, config.scripts);
  }

  public async restoreWorkspace() {
    const session = await this.commands.invoke<string | null>(
      Commands.GetCurrentWorkspace
    );

    if (session) {
      return this.openWorkspace(session);
    }
  }

  public async openWorkspace(path: string) {
    const workspace = new YasumuWorkspace(this, {
      path,
    });

    await workspace.loadMetadata();
    await workspace.createSession();

    this.workspace = workspace;

    return workspace;
  }

  public async closeWorkspace() {
    if (this.workspace) {
      this.workspace = null;
    }
  }

  public async getWorkspacesHistory() {
    const history =
      (await this.store.get<YasumuWorkspaceHistory[]>('yasumu:workspaces')) ??
      [];

    return history;
  }

  public async clearWorkspacesHistory() {
    await this.store.set('yasumu:workspaces', []).catch(Object);
  }
}

export type YasumuCreate<T extends unknown[] = void[], R = unknown> = (
  ...args: T
) => R;

export interface YasumuCoreConfiguration {
  createStore: YasumuCreate<[string], StoreCommon>;
  fs: FileSystemCommon;
  path: PathCommon;
  commands: CommandCommon;
  fetch: FetchCommon;
  dialog: DialogCommon;
  process: ProcessCommon;
  app: ApplicationCommon;
  events: EventsCommon;
  scripts: ScriptsCommon;
  shell: ShellCommon;
}

export function createYasumu(config: YasumuCoreConfiguration): YasumuCore {
  return new YasumuCore(config);
}
