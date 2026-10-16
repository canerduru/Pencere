import { useCallback, useEffect, useRef, useState } from 'react';
import { CalmSession, CalmStep } from '../config/calmSession';

const TICK_MS = 100;

interface UseCalmSessionOptions {
  onFinish?: () => void;
}

export interface CalmSessionApi {
  stepIndex: number;
  step: CalmStep;
  stepProgress: number;
  isPaused: boolean;
  isFinished: boolean;
  next: () => void;
  togglePause: () => void;
  setPaused: (value: boolean) => void;
}

export function useCalmSession(
  session: CalmSession,
  options: UseCalmSessionOptions = {}
): CalmSessionApi {
  const total = session.steps.length;

  const [stepIndex, setStepIndex] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const stepIndexRef = useRef(0);
  const pausedRef = useRef(false);
  const finishedRef = useRef(false);
  const elapsedRef = useRef(0);

  const onFinishRef = useRef(options.onFinish);
  useEffect(() => {
    onFinishRef.current = options.onFinish;
  });

  const setPaused = useCallback((value: boolean) => {
    if (finishedRef.current) return;
    pausedRef.current = value;
    setIsPaused(value);
  }, []);

  const togglePause = useCallback(() => {
    setPaused(!pausedRef.current);
  }, [setPaused]);

  const next = useCallback(() => {
    if (finishedRef.current) return;
    if (stepIndexRef.current >= total - 1) {
      finishedRef.current = true;
      setIsFinished(true);
      onFinishRef.current?.();
      return;
    }
    const nextIndex = stepIndexRef.current + 1;
    stepIndexRef.current = nextIndex;
    elapsedRef.current = 0;
    setStepProgress(0);
    setStepIndex(nextIndex);
  }, [total]);

  useEffect(() => {
    const id = setInterval(() => {
      if (pausedRef.current || finishedRef.current) return;
      const duration = session.steps[stepIndexRef.current].durationMs;
      elapsedRef.current += TICK_MS;
      if (elapsedRef.current >= duration) {
        next();
      } else {
        setStepProgress(elapsedRef.current / duration);
      }
    }, TICK_MS);
    return () => clearInterval(id);
  }, [session, next]);

  return {
    stepIndex,
    step: session.steps[stepIndex],
    stepProgress,
    isPaused,
    isFinished,
    next,
    togglePause,
    setPaused,
  };
}
