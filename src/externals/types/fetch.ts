import type { Callback } from './common.js';

export type FetchCommon = Callback<
  [RequestInfo, RequestInit],
  Promise<Response>
>;
