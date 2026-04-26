import { useState, useEffect } from "react";
import { DEFAULT_PERSONAS } from "./defaultPersonas";

const STORAGE_KEY = "persona-lab-personas";

function loadPersonas() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_PERSONAS;
}

export function usePersonas() {
  const [personas, setPersonas] = useState(loadPersonas);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(personas));
  }, [personas]);

  const addPersona = (persona) => {
    const id = persona.id || `gen-${Date.now()}`;
    setPersonas(prev => [...prev, { ...persona, id }]);
    return id;
  };

  const updatePersona = (updated) => {
    setPersonas(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const removePersona = (id) => {
    setPersonas(prev => prev.filter(p => p.id !== id));
  };

  const resetToDefaults = () => {
    setPersonas(DEFAULT_PERSONAS);
  };

  return { personas, addPersona, updatePersona, removePersona, resetToDefaults };
}
