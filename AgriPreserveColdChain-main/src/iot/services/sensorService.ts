import type { SensorReading } from "../types/sensor";
import { generateSensorReading } from "../data/sensorSimulator";

export function getSensorReading(
  deviceId: string
): SensorReading {
  return generateSensorReading(deviceId);
}

export function getAllSensorReadings(): SensorReading[] {
  const deviceIds = [
    "SENSOR-001",
    "SENSOR-002",
    "SENSOR-003",
  ];

  return deviceIds.map((deviceId) =>
    generateSensorReading(deviceId)
  );
}