import type { Usable } from './types';

export const isFunction = (v: unknown): v is CallableFunction => typeof v === 'function';

export const isString = (v: unknown): v is string => typeof v === 'string';

export const isObject = (v: unknown): v is object => typeof v === 'object' && !!v;

export const use = <T, Args extends unknown[] = []>(factory: Usable<T, Args>, ...args: Args): T =>
  isFunction(factory) ? factory(...args) : factory;

export const pick = <Obj extends object, Keys extends string[]>(obj: Obj, keys: Keys) => Object
  .getOwnPropertyNames(Object.getPrototypeOf(obj))
  .reduce(
    (result, key) => keys.includes(key) ? { ...result, [key]: obj[key as keyof Obj] } : result,
    {},
  ) as Pick<Obj, Keys[number] & keyof Obj>;