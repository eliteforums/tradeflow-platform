import eterniaLogo from "@/assets/eternia_logo_main.svg";

interface EterniaLogoProps {
  size?: number;
  width?: number;
  height?: number;
}

const EterniaLogo = ({ size, width, height }: EterniaLogoProps) => {
  const w = width ?? (size ? size * 1.7 : 54);
  const h = height ?? size ?? 32;
  return (
    <img
      src={eterniaLogo}
      alt="Eternia"
      width={w}
      height={h}
      className="object-contain"
      style={{ width: w, height: h }}
    />
  );
};

export default EterniaLogo;
