/*
   Parameter overrides for every figure.

   Stored as a flat map keyed "{figId}.{paramKey}". An absent key means "use the
   figure's default", which makes Reset a key deletion rather than a lookup of
   defaults, and keeps each figure's overrides isolated from the others.
*/

import { useCallback, useState } from 'react';
import { figById } from './data/figures.js';

const defaultOf = (figId, key) =>
  figById(figId)?.params.find((p) => p.key === key)?.def ?? 0;

export default function useParams() {
  const [overrides, setOverrides] = useState({});

  const getParam = useCallback(
    (figId, key) => overrides[`${figId}.${key}`] ?? defaultOf(figId, key),
    [overrides]
  );

  const setParam = useCallback((figId, key, value) => {
    setOverrides((prev) => ({ ...prev, [`${figId}.${key}`]: value }));
  }, []);

  const resetFigure = useCallback((figId) => {
    setOverrides((prev) => {
      const next = {};
      for (const k of Object.keys(prev)) {
        if (!k.startsWith(`${figId}.`)) next[k] = prev[k];
      }
      return next;
    });
  }, []);

  return { getParam, setParam, resetFigure };
}
