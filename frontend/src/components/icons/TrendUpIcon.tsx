
type TrendUpIconProps = {
  className?: string;
  size?: number;
};

export default function TrendUpIcon({ className, size = 16 }: Readonly<TrendUpIconProps>) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M3 17l6-6 4 4 7-7"
        stroke="#1e3a8a"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14 8h7v7" stroke="#1e3a8a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}


