import type { Usable } from './types';

export type SettingsType = {
  isDev: Usable<boolean>,
};

export const Settings: SettingsType = {
  isDev: () => process.env.NODE_ENV === 'development',
};