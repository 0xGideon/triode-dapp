import { useEffect, useState } from "react";
import "./CountdownTimer.css";

function getRemaining(targetTimestampSeconds) {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const diff = Math.max(0, targetTimestampSeconds - nowSeconds);
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  return { days, hours, minutes };
}

export default function CountdownTimer({ targetTimestampSeconds }) {
  const [remaining, setRemaining] = useState(() => getRemaining(targetTimestampSeconds));

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(getRemaining(targetTimestampSeconds));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetTimestampSeconds]);

  return (
    <div className="countdown-timer">
      <div className="countdown-timer__box">
        <p className="countdown-timer__value">{String(remaining.days).padStart(2, "0")}</p>
        <p className="countdown-timer__label">DAYS</p>
      </div>
      <div className="countdown-timer__box">
        <p className="countdown-timer__value">{String(remaining.hours).padStart(2, "0")}</p>
        <p className="countdown-timer__label">HOURS</p>
      </div>
      <div className="countdown-timer__box">
        <p className="countdown-timer__value">{String(remaining.minutes).padStart(2, "0")}</p>
        <p className="countdown-timer__label">MINS</p>
      </div>
    </div>
  );
}
