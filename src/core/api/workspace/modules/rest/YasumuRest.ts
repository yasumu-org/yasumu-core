import { HttpMethods, isHttpMethod } from '@/core/common/constants.js';
import { YasumuWorkspace } from '../../YasumuWorkspace.js';
import { YasumuWorkspaceFiles } from '../../constants.js';
import { YasumuRestEntity } from './YasumuRestEntity.js';

export interface YasumuRestRequest {
  path: string;
  method: HttpMethods | null;
  name: string;
  children: YasumuRestRequest[] | null;
}

export interface TreeViewElement {
  id: string;
  name: string;
  children?: TreeViewElement[];
}

export class YasumuRest {
  public constructor(public readonly workspace: YasumuWorkspace) {}

  public getPath() {
    return this.workspace.resolvePath(YasumuWorkspaceFiles.Http);
  }

  public async ensureSelf() {
    const path = this.getPath();
    const hasPath = await this.workspace.yasumu.fs.exists(path);

    if (!hasPath) {
      await this.workspace.yasumu.fs.mkdir(path);
    }
  }

  public async open(path: string) {
    await this.ensureSelf();

    const hasRequest = await this.workspace.yasumu.fs.exists(path);

    if (!hasRequest) return null;

    const data = await this.workspace.yasumu.fs.readTextFile(path);

    try {
      return new YasumuRestEntity(this, JSON.parse(data));
    } catch {
      const id = await this.workspace.yasumu.path.basename(path);
      const name = (await YasumuRestEntity.getName(id)) ?? 'New request';
      const method = YasumuRestEntity.getMethod(id) ?? HttpMethods.GET;

      const entity = new YasumuRestEntity(this, {
        name,
        method,
        url: '',
        headers: [],
        body: null,
        path,
        response: null,
      });

      await entity.save();

      return entity;
    }
  }

  public async copy(current: string, target: string) {
    await this.ensureSelf();

    const hasRequest = await this.workspace.yasumu.fs.exists(current);

    if (!hasRequest) return;

    const currentName = await this.workspace.yasumu.path.basename(current);

    const doesTargetHaveCurrentName = await this.workspace.yasumu.fs.exists(
      await this.workspace.yasumu.path.join(target, currentName)
    );

    if (doesTargetHaveCurrentName) {
      const targetName = await this.workspace.yasumu.path.basename(target);
      target = await this.workspace.yasumu.path.join(
        target,
        `${targetName} - Copy`
      );
    } else {
      target = await this.workspace.yasumu.path.join(target, currentName);
    }

    await this.workspace.yasumu.fs.copyFile(current, target);
  }

  public async move(current: string, target: string) {
    await this.ensureSelf();

    const hasRequest = await this.workspace.yasumu.fs.exists(current);

    if (!hasRequest) return;

    const currentName = await this.workspace.yasumu.path.basename(current);

    const doesTargetHaveCurrentName = await this.workspace.yasumu.fs.exists(
      await this.workspace.yasumu.path.join(target, currentName)
    );

    if (doesTargetHaveCurrentName) {
      const targetName = await this.workspace.yasumu.path.basename(target);
      target = await this.workspace.yasumu.path.join(
        target,
        `${targetName} - Copy`
      );
    } else {
      target = await this.workspace.yasumu.path.join(target, currentName);
    }

    await this.workspace.yasumu.fs.rename(current, target);
  }

  public async delete(path: string) {
    await this.ensureSelf();

    const hasRequest = await this.workspace.yasumu.fs.exists(path);

    if (!hasRequest) return;

    await this.workspace.yasumu.fs.remove(path, {
      recursive: true,
    });
  }

  public async rename(path: string, newName: string, dir: boolean) {
    await this.ensureSelf();

    if (!newName) return;

    const hasRequest = await this.workspace.yasumu.fs.exists(path);

    if (!hasRequest) return;

    const ext = dir
      ? ''
      : await this.workspace.yasumu.path.extname(path).catch(() => '');
    const dirName = dir
      ? (await this.workspace.yasumu.path.dirname(path)).replace(
          await this.workspace.yasumu.path.basename(path),
          ''
        )
      : await this.workspace.yasumu.path.dirname(path);

    const extension = ext ? `.${ext}` : '';
    const newPath = await this.workspace.yasumu.path.join(
      dirName,
      `${newName}${extension}`
    );

    await this.workspace.yasumu.fs.rename(path, newPath);
  }

  public async create(
    name: string,
    method: null,
    basePath?: string
  ): Promise<void>;
  public async create(
    name: string,
    method: HttpMethods,
    basePath?: string
  ): Promise<YasumuRestEntity>;
  public async create(
    name: string,
    method: HttpMethods | null,
    basePath = this.getPath()
  ): Promise<YasumuRestEntity | void> {
    await this.ensureSelf();

    if (!method) {
      const path = await this.workspace.yasumu.path.join(basePath, name);
      await this.workspace.yasumu.fs.mkdir(path, { recursive: true });
      return;
    }

    const path = await this.workspace.yasumu.path.join(
      basePath,
      `${name}.${method}`
    );

    const entity = new YasumuRestEntity(this, {
      name,
      method,
      url: '',
      headers: [],
      body: null,
      path,
      response: null,
    });

    await entity.save();

    return entity;
  }

  public async getAsTree(): Promise<TreeViewElement[]> {
    const requests = await this.getRequests();

    const map = (req: YasumuRestRequest): TreeViewElement => {
      if (req.children) {
        return {
          id: req.path,
          name: req.name,
          children: req.children.map(map),
        };
      }

      return {
        name: req.name,
        id: req.path,
      };
    };

    const data: TreeViewElement[] = requests.map(map);

    return data;
  }

  public async getRequests(): Promise<YasumuRestRequest[]> {
    const path = this.getPath();
    const hasRequests = await this.workspace.yasumu.fs.exists(path);

    if (!hasRequests) {
      await this.workspace.yasumu.fs.mkdir(path);
      return [];
    }

    return this.#scan(path);
  }

  async #scan(path: string): Promise<YasumuRestRequest[]> {
    const entries = await this.workspace.yasumu.fs.readDir(path);

    const data: YasumuRestRequest[] = [];

    for (const entry of entries) {
      if (entry.isDirectory) {
        const next = await this.workspace.yasumu.path.join(path, entry.name);
        const child = await this.#scan(next);

        const info = {
          name: entry.name,
          method: null,
          children: child,
          path: next,
        } satisfies YasumuRestRequest;

        data.push(info);
      }

      const [name, method] = entry.name.split('.');

      if (!name || !isHttpMethod(method)) continue;

      data.push({
        path: await this.workspace.yasumu.path.join(path, entry.name),
        name: entry.name,
        method,
        children: null,
      } satisfies YasumuRestRequest);
    }

    return data.sort((a, b) => {
      if (a.method === null && b.method !== null) return -1;
      if (a.method !== null && b.method === null) return 1;
      return a.name.localeCompare(b.name);
    });
  }
}
