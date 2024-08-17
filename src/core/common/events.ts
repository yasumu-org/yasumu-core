export const YasumuEvents = {
  NewEmail: 'new-email',
} as const;

export type YasumuEvents = (typeof YasumuEvents)[keyof typeof YasumuEvents];
