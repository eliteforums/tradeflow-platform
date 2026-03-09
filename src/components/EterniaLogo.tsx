const EterniaLogo = ({ size = 32 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 512 512"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="eternia-g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(174, 62%, 47%)" />
        <stop offset="100%" stopColor="hsl(270, 60%, 65%)" />
      </linearGradient>
    </defs>
    <rect width="512" height="512" rx="112" fill="hsl(240, 10%, 4%)" />
    <path
      d="M256 96 C256 96 310 180 310 240 C310 280 286 310 256 310 C226 310 202 280 202 240 C202 180 256 96 256 96Z"
      fill="url(#eternia-g)"
      opacity="0.9"
    />
    <path
      d="M256 170 C256 170 290 220 290 256 C290 280 275 298 256 298 C237 298 222 280 222 256 C222 220 256 170 256 170Z"
      fill="hsl(240, 10%, 4%)"
      opacity="0.5"
    />
    <circle cx="256" cy="350" r="8" fill="url(#eternia-g)" />
    <circle cx="200" cy="330" r="5" fill="hsl(174, 62%, 47%)" opacity="0.5" />
    <circle cx="312" cy="330" r="5" fill="hsl(270, 60%, 65%)" opacity="0.5" />
    <path
      d="M180 360 Q256 400 332 360"
      stroke="url(#eternia-g)"
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

export default EterniaLogo;
