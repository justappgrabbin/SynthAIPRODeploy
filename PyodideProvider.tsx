"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { loadPyodide, PyodideInterface } from 'pyodide';

interface PyodideContextType {
  pyodide: PyodideInterface | null;
  isLoading: boolean;
  error: string | null;
  runPython: (code: string, locals?: Record<string, any>) => Promise<any>;
  runPythonAsync: (code: string, locals?: Record<string, any>) => Promise<any>;
  installPackage: (packageName: string) => Promise<void>;
}

const PyodideContext = createContext<PyodideContextType>({
  pyodide: null,
  isLoading: true,
  error: null,
  runPython: async () => null,
  runPythonAsync: async () => null,
  installPackage: async () => {},
});

export function PyodideProvider({ children }: { children: React.ReactNode }) {
  const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initPyodide() {
      try {
        setIsLoading(true);
        const instance = await loadPyodide({
          indexURL: `https://cdn.jsdelivr.net/pyodide/v0.26.0/full/`,
          stdout: (text) => console.log('[Pyodide]', text),
          stderr: (text) => console.error('[Pyodide]', text),
        });

        await instance.loadPackage(['numpy', 'pandas', 'micropip']);
        await instance.runPythonAsync(`
          import micropip
          await micropip.install('python-dateutil')
          await micropip.install('pyyaml')
        `);

        if (mounted) {
          setPyodide(instance);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load Pyodide');
          setIsLoading(false);
        }
      }
    }

    initPyodide();
    return () => { mounted = false; };
  }, []);

  const runPython = useCallback(async (code: string, locals?: Record<string, any>) => {
    if (!pyodide) throw new Error('Pyodide not initialized');
    if (locals) {
      for (const [key, value] of Object.entries(locals)) {
        pyodide.globals.set(key, value);
      }
    }
    return pyodide.runPython(code);
  }, [pyodide]);

  const runPythonAsync = useCallback(async (code: string, locals?: Record<string, any>) => {
    if (!pyodide) throw new Error('Pyodide not initialized');
    if (locals) {
      for (const [key, value] of Object.entries(locals)) {
        pyodide.globals.set(key, value);
      }
    }
    return pyodide.runPythonAsync(code);
  }, [pyodide]);

  const installPackage = useCallback(async (packageName: string) => {
    if (!pyodide) throw new Error('Pyodide not initialized');
    await pyodide.runPythonAsync(`
      import micropip
      await micropip.install('${packageName}')
    `);
  }, [pyodide]);

  return (
    <PyodideContext.Provider value={{ pyodide, isLoading, error, runPython, runPythonAsync, installPackage }}>
      {children}
    </PyodideContext.Provider>
  );
}

export const usePyodide = () => useContext(PyodideContext);
