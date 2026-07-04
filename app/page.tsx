import { WeatherDashboard } from "@/components/weather/weather-dashboard";
import { sampleWeather } from "@/lib/weather/sample-data";

export default function Home() {
  return <WeatherDashboard initialWeather={sampleWeather} />;
}
