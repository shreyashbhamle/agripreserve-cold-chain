import type { SensorReading } from "../types/sensor";

export interface SensorAlert {
  deviceId: string;
  type: "temperature" | "humidity" | "battery";
  message: string;
  severity: "warning" | "critical";
}

export function checkSensorAlerts(
  sensor: SensorReading
): SensorAlert[] {
  const alerts: SensorAlert[] = [];

  if (sensor.temperature > 8) {
    alerts.push({
      deviceId: sensor.deviceId,
      type: "temperature",
      message: `High temperature: ${sensor.temperature}°C`,
      severity: "critical",
    });
  }

  if (sensor.humidity > 85) {
    alerts.push({
      deviceId: sensor.deviceId,
      type: "humidity",
      message: `High humidity: ${sensor.humidity}%`,
      severity: "warning",
    });
  }

  if (sensor.battery < 20) {
    alerts.push({
      deviceId: sensor.deviceId,
      type: "battery",
      message: `Low battery: ${sensor.battery}%`,
      severity: "warning",
    });
  }

  return alerts;
}