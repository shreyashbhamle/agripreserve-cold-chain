import SensorMonitor from "../../iot/components/SensorMonitor";
import { DataSourceBanner, PageHeader } from "../../components/ui/SharedComponents";

export default function IoTMonitoring() {
  return (
    <div className="space-y-6">
      <PageHeader
        role="farmer"
        eyebrow="PACKHOUSE & REEFER IOT TELEMETRY"
        title="Farm Cold-Room & Shipment Sensor Monitoring"
        description="Monitor ESP32/DHT22 packhouse chambers and outbound reefer sensors. Inject simulated telemetry readings to test thermal threshold alerts."
        dataMode="SIMULATED IOT STREAM"
      />
      <DataSourceBanner
        mode="SIMULATED / HARDWARE-READY"
        note="Sensor cards below combine SQLite telemetry from datasets/synthetic/sensor_readings.csv with an interactive fault simulator. Physical ESP32 nodes can POST to /api/sensors/readings."
      />
      <SensorMonitor />
    </div>
  );
}