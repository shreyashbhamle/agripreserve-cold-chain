import { generateSensorReading } from "./sensorSimulator";

setInterval(() => {
  const reading = generateSensorReading("SENSOR-001");

  console.clear();
  console.log("📡 LIVE IoT DATA");
  console.log(reading);
}, 3000);