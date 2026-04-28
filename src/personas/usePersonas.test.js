import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { usePersonas } from './usePersonas';
import { DEFAULT_PERSONAS } from './defaultPersonas';

describe('usePersonas hook', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with default personas when localStorage is empty', () => {
    const { result } = renderHook(() => usePersonas());
    expect(result.current.personas).toEqual(DEFAULT_PERSONAS);
  });

  it('should load personas from localStorage if available', () => {
    const mockPersonas = [{ id: 'mock-1', name: 'Mock Persona' }];
    localStorage.setItem('persona-lab-personas', JSON.stringify(mockPersonas));

    const { result } = renderHook(() => usePersonas());
    expect(result.current.personas).toEqual(mockPersonas);
  });

  it('should add a new persona', () => {
    const { result } = renderHook(() => usePersonas());
    const initialCount = result.current.personas.length;

    act(() => {
      result.current.addPersona({ name: 'New Persona' });
    });

    expect(result.current.personas.length).toBe(initialCount + 1);
    expect(result.current.personas[initialCount].name).toBe('New Persona');
    // It should have generated an ID
    expect(result.current.personas[initialCount].id).toBeDefined();
  });

  it('should update an existing persona', () => {
    const { result } = renderHook(() => usePersonas());
    const firstPersona = result.current.personas[0];
    
    const updatedPersona = { ...firstPersona, name: 'Updated Name' };

    act(() => {
      result.current.updatePersona(updatedPersona);
    });

    expect(result.current.personas[0].name).toBe('Updated Name');
  });

  it('should remove a persona', () => {
    const { result } = renderHook(() => usePersonas());
    const initialCount = result.current.personas.length;
    const personaToRemove = result.current.personas[0];

    act(() => {
      result.current.removePersona(personaToRemove.id);
    });

    expect(result.current.personas.length).toBe(initialCount - 1);
    expect(result.current.personas.find(p => p.id === personaToRemove.id)).toBeUndefined();
  });

  it('should reset to defaults', () => {
    const { result } = renderHook(() => usePersonas());
    
    // First modify the state
    act(() => {
      result.current.removePersona(result.current.personas[0].id);
    });
    
    expect(result.current.personas.length).toBeLessThan(DEFAULT_PERSONAS.length);

    // Then reset
    act(() => {
      result.current.resetToDefaults();
    });

    expect(result.current.personas).toEqual(DEFAULT_PERSONAS);
  });
});
