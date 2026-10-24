import { getSensorHistory } from "../data/sensorHistory";

export default function SensorHistory() {
  const history = getSensorHistory();

  if (history.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900">
          Sensor History
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Waiting for sensor data...
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-slate-900">
        Sensor History
      </h2>

      <div className="mt-4 space-y-2">
        {history
          .slice(-10)
          .reverse()
          .map((sensor, index) => (
            <div
              key={`${sensor.timestamp}-${index}`}
              className="grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-3 text-sm md:grid-cols-4"
            >
              <span className="font-medium text-slate-900">
                {sensor.deviceId}
              </span>

              <span>
                🌡️ {sensor.temperature}°C
              </span>

              <span>
                💧 {sensor.humidity}%
              </span>

              <span className="text-slate-500">
                {new Date(sensor.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
