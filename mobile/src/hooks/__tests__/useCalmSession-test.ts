import { act, renderHook } from '@testing-library/react-native';
import { CalmSession } from '../../config/calmSession';
import { useCalmSession } from '../useCalmSession';

const SESSION: CalmSession = {
  id: 'test',
  title: 'Test',
  steps: [
    { id: 'a', kind: 'settle', text: 'A', durationMs: 10000 },
    { id: 'b', kind: 'closing', text: 'B', durationMs: 5000 },
  ],
};

describe('useCalmSession', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('ilk adımla başlar', async () => {
    const { result } = await renderHook(() => useCalmSession(SESSION));
    expect(result.current.stepIndex).toBe(0);
    expect(result.current.step.id).toBe('a');
    expect(result.current.isFinished).toBe(false);
  });

  it('süre dolunca otomatik ilerler', async () => {
    const { result } = await renderHook(() => useCalmSession(SESSION));
    await act(() => {
      jest.advanceTimersByTime(10000);
    });
    expect(result.current.stepIndex).toBe(1);
    expect(result.current.step.id).toBe('b');
  });

  it('son adım bitince isFinished olur ve onFinish çağrılır', async () => {
    const onFinish = jest.fn();
    const { result } = await renderHook(() => useCalmSession(SESSION, { onFinish }));
    await act(() => {
      jest.advanceTimersByTime(15000);
    });
    expect(result.current.isFinished).toBe(true);
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('next() ile hemen ilerler', async () => {
    const { result } = await renderHook(() => useCalmSession(SESSION));
    await act(() => {
      result.current.next();
    });
    expect(result.current.stepIndex).toBe(1);
    expect(result.current.stepProgress).toBe(0);
  });

  it('duraklatılınca ilerlemez', async () => {
    const { result } = await renderHook(() => useCalmSession(SESSION));
    await act(() => {
      result.current.togglePause();
    });
    expect(result.current.isPaused).toBe(true);
    await act(() => {
      jest.advanceTimersByTime(10000);
    });
    expect(result.current.stepIndex).toBe(0);
  });

  it('devam ettirilince oto-akış sürer', async () => {
    const { result } = await renderHook(() => useCalmSession(SESSION));
    await act(() => {
      result.current.togglePause();
    });
    await act(() => {
      jest.advanceTimersByTime(20000);
    });
    expect(result.current.stepIndex).toBe(0);
    await act(() => {
      result.current.togglePause();
    });
    await act(() => {
      jest.advanceTimersByTime(10000);
    });
    expect(result.current.stepIndex).toBe(1);
  });

  it("unmount'ta interval temizlenir", async () => {
    const clearSpy = jest.spyOn(globalThis, 'clearInterval');
    const { unmount } = await renderHook(() => useCalmSession(SESSION));
    await unmount();
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });
});
