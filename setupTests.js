require('@testing-library/jest-dom');

jest.mock('react', () => {
  const originalReact = jest.requireActual('react');

  return {
    ...originalReact,
    useState: function (initialState) {
      const [state, setState] = originalReact.useState(initialState);

      const enhancedSetState = originalReact.useCallback(v => {
        initialState?.onSetState?.(v);
        setState(v);
      }, []);

      return [state, enhancedSetState];
    },
  };
});