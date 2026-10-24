import { addSensorReading } from "../data/sensorHistory";
const newReadings = getAllSensorReadings();
newReadings.forEach(addSensorReading);
import { useEffect, useState } from "react";
import type { SensorReading } from "../types/sensor";
import { getAllSensorReadings } from "../services/sensorService";
import {
  checkSensorAlerts,
  type SensorAlert,
} from "../services/sensorAlertService";

export function useSensorData(interval = 3000) {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [alerts, setAlerts] = useState<SensorAlert[]>([]);

  useEffect(() => {
    const updateReadings = () => {
      const newReadings = getAllSensorReadings();

      setReadings(newReadings);

      const newAlerts = newReadings.flatMap((sensor) =>
        checkSensorAlerts(sensor)
      );

      setAlerts(newAlerts);
    };

    updateReadings();

    const timer = setInterval(updateReadings, interval);

    return () => clearInterval(timer);
  }, [interval]);

  return {
    readings,
    alerts,
  };
}