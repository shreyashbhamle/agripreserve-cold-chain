import type { SensorReading } from "../types/sensor";

const history: SensorReading[] = [];

export function addSensorReading(reading: SensorReading) {
  history.push(reading);

  if (history.length > 50) {
    history.shift();
  }
}

export function getSensorHistory() {
  return history;
}