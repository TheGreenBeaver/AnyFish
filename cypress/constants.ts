import type { StringMap } from '../utils/types';

const classStr = 'Class' as const;
const idStr = 'Id' as const;
const sel = 'Selector' as const;

const prefixBySelectorKind: StringMap<string> = {
  [classStr]: '.',
  [idStr]: '#',
};

const pattern = new RegExp(`(${classStr}|${idStr})$`, 'g');

type Sel = typeof sel;
type Id = typeof idStr;
type Class = typeof classStr;
type ExtractMainName<Name extends string> = `${Name extends `${infer MainName}${Class}`
  ? MainName
  : (
    Name extends `${infer MainName}${Id}`
      ? MainName
      : Name
  )}${Sel}`;

type SelectorProvider<Src extends StringMap<string>> = Src & {
  [Key in keyof Src as ExtractMainName<Key & string>]: string
};

const getSelector = (key: string, value: string): string => {
  const selectorKind = key.match(pattern)?.[0];
  const prefix = (selectorKind && prefixBySelectorKind[selectorKind]) ?? '';
  return `${prefix}${value}`;
};

const createSelectorProvider = <Src extends StringMap<string>>(src: Src): SelectorProvider<Src> => ({
  ...src,
  ...Object.entries(src).reduce((result, [key, value]) => ({
    ...result,
    [`${key.replace(pattern, '')}${sel}`]: getSelector(key, value),
  }), {}),
});

// === === ===

export const UseDimensions = createSelectorProvider({
  WidthId: 'width',
  HeightId: 'height',
  MeasuredId: 'measured',
});

export const UsePersistentState = {
  elements: createSelectorProvider({
    ButtonId: 'clear-button',
    IndicatorId: 'indicator',
  }),
  indicatorText: 'CORRECT',
};