export type SensorStatus = "online" | "offline";

export interface SensorReading {
  deviceId: string;
  temperature: number;
  humidity: number;
  latitude: number;
  longitude: number;
  battery: number;
  status: SensorStatus;
  timestamp: string;
}