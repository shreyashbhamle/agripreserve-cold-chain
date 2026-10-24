import type { SensorReading } from "../types/sensor";

export function generateSensorReading(
  deviceId: string
): SensorReading {
  const temperature = Number(
    (2 + Math.random() * 8).toFixed(1)
  );

  const humidity = Number(
    (60 + Math.random() * 35).toFixed(1)
  );

  const battery = Math.floor(
    15 + Math.random() * 85
  );

  const isOnline = Math.random() > 0.1;

  return {
    deviceId,
    temperature,
    humidity,
    latitude: 19.076,
    longitude: 72.8777,
    battery,
    status: isOnline ? "online" : "offline",
    timestamp: new Date().toISOString(),
  };
}