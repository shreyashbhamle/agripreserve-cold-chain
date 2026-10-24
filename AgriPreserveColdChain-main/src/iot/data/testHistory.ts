import { generateSensorReading } from "./sensorSimulator";
import {
  addSensorReading,
  getSensorHistory,
} from "./sensorHistory";

for (let i = 0; i < 5; i++) {
  addSensorReading(
    generateSensorReading("SENSOR-001")
  );
}

console.log("📊 Sensor History:");
console.log(getSensorHistory());