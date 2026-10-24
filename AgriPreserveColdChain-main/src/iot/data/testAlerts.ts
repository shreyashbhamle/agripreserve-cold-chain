import { generateSensorReading } from "./sensorSimulator";
import { checkSensorAlerts } from "../services/sensorAlertService";

const sensor = generateSensorReading("SENSOR-001");

console.log("📡 Sensor:");
console.log(sensor);

const alerts = checkSensorAlerts(sensor);

console.log("🚨 Alerts:");
console.log(alerts);