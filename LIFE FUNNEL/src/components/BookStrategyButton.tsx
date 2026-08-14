import { trackCalendarClick } from "@/lib/automationHooks";
import { useFunnel } from "@/context/FunnelContext";

interface Props {
  className?: string;
}

export function BookStrategyButton({ className = "" }: Props) {
  const { setClickedCalendar } = useFunnel();
  const url = import.meta.env.VITE_CALENDAR_URL?.trim() || "https://calendar.google.com";

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn btn--secondary ${className}`.trim()}
      onClick={() => {
        setClickedCalendar(true);
        trackCalendarClick(url);
      }}
    >
      Book a strategy session
    </a>
  );
}
