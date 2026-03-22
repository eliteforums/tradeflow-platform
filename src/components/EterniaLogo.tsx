import eterniaLogo from "@/assets/eternia_logo_main.svg";

const EterniaLogo = ({ size = 32 }: { size?: number }) => (
  <img
    src={eterniaLogo}
    alt="Eternia"
    width={size}
    height={size}
    className="object-contain"
    style={{ width: size, height: size }}
  />
);

export default EterniaLogo;
