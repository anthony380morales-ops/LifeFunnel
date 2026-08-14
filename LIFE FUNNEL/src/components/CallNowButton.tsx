import { envPhone, formatPhoneDisplay, getTelHref } from "@/lib/phone";
import { trackCallClick } from "@/lib/automationHooks";
import { useFunnel } from "@/context/FunnelContext";

interface Props {
  className?: string;
  variant?: "primary" | "secondary";
  label?: string;
}

export function CallNowButton({ className = "", variant = "primary", label }: Props) {
  const { setClickedCall } = useFunnel();
  const raw = envPhone();
  const tel = getTelHref(raw);
  const display = formatPhoneDisplay(raw);
  const cls =
    variant === "primary"
      ? `btn btn--primary btn--call ${className}`.trim()
      : `btn btn--secondary btn--call ${className}`.trim();

  return (
    <a
      href={tel}
      className={cls}
      onClick={() => {
        setClickedCall(true);
        trackCallClick(display);
      }}
    >
      {label ?? `Call now — ${display}`}
    </a>
  );
}
