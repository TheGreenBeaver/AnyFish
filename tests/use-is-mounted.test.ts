import useIsMounted from '../src/use-is-mounted';
import { createSwitchingComponents, extractLastResult, spyOnSingle } from './test-utils';

describe('useIsMounted', () => {
  it('Should represent the mounted state of a React component', () => {
    const [useIsMountedHook, isMountedHookSpy] = spyOnSingle(useIsMounted);
    const [switchTab] = createSwitchingComponents({ useHook: useIsMountedHook });

    expect(extractLastResult(isMountedHookSpy)()).toBeTruthy();

    switchTab();
    expect(extractLastResult(isMountedHookSpy)()).toBeFalsy();
  });
});