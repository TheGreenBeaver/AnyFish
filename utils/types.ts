export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type SimpleFunction = (...args: unknown[]) => unknown;

export type StringMap<T = unknown> = Record<string, T>;

export type UnionToIntersection<U> = (
  U extends unknown ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

export type StringMapToUnion<Map> = Map[keyof Map];

type ArrayToMap<Arr extends unknown[], Key extends string = 'A'> = Arr extends [infer Only]
  ? { [K in Key]: Only }
  : (
    Arr extends [infer First, ...infer Tail]
      ? ArrayToMap<Tail, `${Key}A`> & { [K in Key]: First }
      : never
  );

type MergeExcept<Obj, Key extends keyof Obj> = UnionToIntersection<Obj[Exclude<keyof Obj, Key>]>;

type ExclusiveIntersection<Map> = {
  [PresentKey in keyof Map]: Map[PresentKey] & Partial<Record<keyof MergeExcept<Map, PresentKey>, never>>
};

export type ExclusiveUnion<Options extends StringMap[]> = StringMapToUnion<ExclusiveIntersection<ArrayToMap<Options>>>;

export type Usable<T, Args extends unknown[] = []> = T | ((...args: Args) => T);

export type MapKey = string | number | symbol;