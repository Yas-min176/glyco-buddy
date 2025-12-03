import { GlucoseReading, calculateRecommendation } from './glucoseCalculator';

const READINGS_KEY = 'glucose_readings';
const PATIENT_KEY = 'patient_info';

export interface PatientInfo {
  name: string;
  birthDate?: string;
  caregiverName?: string;
  caregiverContact?: string;
}

export function saveReading(value: number): GlucoseReading {
  const recommendation = calculateRecommendation(value);
  
  const reading: GlucoseReading = {
    id: crypto.randomUUID(),
    value,
    timestamp: new Date(),
    recommendation: recommendation.message,
    status: recommendation.status,
    insulinUnits: recommendation.insulinUnits
  };
  
  const readings = getReadings();
  readings.unshift(reading);
  
  // Keep only last 100 readings
  const trimmedReadings = readings.slice(0, 100);
  
  localStorage.setItem(READINGS_KEY, JSON.stringify(trimmedReadings));
  
  return reading;
}

export function getReadings(): GlucoseReading[] {
  const stored = localStorage.getItem(READINGS_KEY);
  if (!stored) return [];
  
  try {
    const readings = JSON.parse(stored);
    return readings.map((r: GlucoseReading) => ({
      ...r,
      timestamp: new Date(r.timestamp)
    }));
  } catch {
    return [];
  }
}

export function getLastReading(): GlucoseReading | null {
  const readings = getReadings();
  return readings[0] || null;
}

export function deleteReading(id: string): void {
  const readings = getReadings();
  const filtered = readings.filter(r => r.id !== id);
  localStorage.setItem(READINGS_KEY, JSON.stringify(filtered));
}

export function savePatientInfo(info: PatientInfo): void {
  localStorage.setItem(PATIENT_KEY, JSON.stringify(info));
}

export function getPatientInfo(): PatientInfo | null {
  const stored = localStorage.getItem(PATIENT_KEY);
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function getTodayReadings(): GlucoseReading[] {
  const readings = getReadings();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return readings.filter(r => {
    const readingDate = new Date(r.timestamp);
    readingDate.setHours(0, 0, 0, 0);
    return readingDate.getTime() === today.getTime();
  });
}

export function getWeekReadings(): GlucoseReading[] {
  const readings = getReadings();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  return readings.filter(r => new Date(r.timestamp) >= weekAgo);
}
