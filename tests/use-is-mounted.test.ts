import { useIsMounted } from '../src/use-is-mounted';
import { createSwitchingComponents, extractLastResult, spyOnSingle } from './test-utils';

describe('useIsMounted', () => {
  it('Should represent the mounted state of a React component', () => {
    const [useIsMountedHook, isMountedHookSpy] = spyOnSingle(useIsMounted);
    const [switchTab] = createSwitchingComponents({ useHook: useIsMountedHook });

    const firstGetIsMounted = extractLastResult(isMountedHookSpy);
    expect(firstGetIsMounted()).toBeTruthy();

    switchTab();
    const secondGetIsMounted = extractLastResult(isMountedHookSpy);
    expect(secondGetIsMounted()).toBeFalsy();

    expect(secondGetIsMounted).toBe(firstGetIsMounted);
  });
});