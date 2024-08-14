import type { YasumuCore } from '@/core/index.js';
import type { ScriptsCommon } from './types.js';

export class YasumuScripts {
  public constructor(
    public readonly yasumu: YasumuCore,
    private readonly adapter: ScriptsCommon
  ) {}

  public createContextData<T = unknown>(data: T): string {
    return JSON.stringify(data);
  }

  public async run<T = unknown, C = unknown>(
    script: string,
    context: C
  ): Promise<T> {
    const ctx = this.createContextData(context);
    const result = await this.adapter.evaluate<T>(script, ctx);

    return result;
  }
}
