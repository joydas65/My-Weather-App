import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Sun,
  type LucideIcon
} from "lucide-react";
import type { WeatherCondition } from "@/lib/weather/types";

type WeatherConditionPresentation = {
  label: string;
  icon: LucideIcon;
  containerClass: string;
  iconClass: string;
};

const conditionPresentation: Record<WeatherCondition, WeatherConditionPresentation> = {
  clear: {
    label: "Clear weather",
    icon: Sun,
    containerClass: "bg-amber-100/15",
    iconClass: "text-amber-200"
  },
  clouds: {
    label: "Cloudy weather",
    icon: CloudSun,
    containerClass: "bg-sky-100/15",
    iconClass: "text-amber-200"
  },
  rain: {
    label: "Rainy weather",
    icon: CloudRain,
    containerClass: "bg-cyan-100/15",
    iconClass: "text-cyan-200"
  },
  storm: {
    label: "Stormy weather",
    icon: CloudLightning,
    containerClass: "bg-violet-100/15",
    iconClass: "text-violet-200"
  },
  mist: {
    label: "Misty weather",
    icon: CloudFog,
    containerClass: "bg-slate-100/15",
    iconClass: "text-slate-200"
  },
  snow: {
    label: "Snowy weather",
    icon: CloudSnow,
    containerClass: "bg-blue-100/15",
    iconClass: "text-blue-100"
  }
};

export function getWeatherConditionPresentation(
  condition: WeatherCondition,
  isDay: boolean
) {
  if (condition === "clear" && !isDay) {
    return {
      ...conditionPresentation.clear,
      label: "Clear night weather",
      icon: Moon,
      iconClass: "text-indigo-100"
    };
  }

  if (condition === "clouds" && !isDay) {
    return {
      ...conditionPresentation.clouds,
      label: "Cloudy night weather",
      icon: Cloud,
      iconClass: "text-slate-100"
    };
  }

  return conditionPresentation[condition];
}

export function WeatherConditionIcon({
  condition,
  isDay
}: {
  condition: WeatherCondition;
  isDay: boolean;
}) {
  const presentation = getWeatherConditionPresentation(condition, isDay);
  const Icon = presentation.icon;

  return (
    <span
      aria-label={presentation.label}
      className={`inline-flex rounded-lg p-4 ${presentation.containerClass}`}
      role="img"
    >
      <Icon aria-hidden="true" className={`h-16 w-16 ${presentation.iconClass}`} />
    </span>
  );
}
