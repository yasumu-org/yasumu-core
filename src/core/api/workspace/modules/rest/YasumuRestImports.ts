import { toJsonString } from 'curlconverter';
import type { YasumuRest } from './YasumuRest.js';
import type { KeyValue, YasumuRestEntity } from './YasumuRestEntity.js';
import type { HttpMethods } from '@/core/common/constants.js';

export interface YasumuRestImportSource {
  source: string;
  name: string;
  method?: HttpMethods;
  path?: string;
}

export class YasumuRestImports {
  /**
   * Creates a new instance of YasumuRestImports.
   * @param rest The rest instance.
   */
  public constructor(public readonly rest: YasumuRest) {}

  /**
   * Import curl command as YasumuRestEntity.
   * @param source The source to import.
   */
  public async curl(source: YasumuRestImportSource): Promise<YasumuRestEntity> {
    const data = JSON.parse(toJsonString(source.source));
    const method = (
      'method' in data ? String(data.method).toUpperCase() : 'GET'
    ) as HttpMethods;

    const entity = await this.rest.create(source.name, method, source.path);

    if ('raw_url' in data && data.raw_url) entity.setUrl(data.raw_url);

    if ('headers' in data && data.headers) {
      const headers: Array<KeyValue<string, string>> = Object.entries(
        data.headers
      ).map(
        ([key, value]) =>
          ({
            key,
            value,
          } as KeyValue<string, string>)
      );

      entity.setHeaders(headers);
    }

    if ('data' in data && data.data) {
      const body =
        typeof data.data === 'string'
          ? {
              text: data.data,
            }
          : { json: JSON.stringify(data.data) };

      entity.setBody(body);
    }

    await entity.save();

    return entity;
  }
}
