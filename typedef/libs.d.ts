/* eslint-disable @typescript-eslint/consistent-type-definitions */
import 'lodash';

declare module 'lodash' {
  interface LoDashStatic {
    pick<
      Obj extends object,
      Keys extends string[],
    >(obj: Obj, keys: Keys): Pick<Obj, Keys[number] & keyof Obj>,
    isPlainObject(v: unknown): v is Record<string, unknown>,
  }
}