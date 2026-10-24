import { getAllSensorReadings } from "../services/sensorService";

const readings = getAllSensorReadings();

console.log("All IoT Sensors:");
console.log(readings);