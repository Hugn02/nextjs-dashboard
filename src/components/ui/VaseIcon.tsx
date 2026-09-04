import React from "react";

interface VaseIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

export default function VaseIcon({
  size = 24,
  className = "",
  ...props
}: VaseIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Vành miệng bình gốm */}
      <ellipse cx="12" cy="3" rx="3.5" ry="1" />
      {/* Cổ và dáng thân bình Bát Tràng */}
      <path d="M8.5 3.5c0 1.5-.7 2.8-1.8 4C5.2 9.2 4.5 11 4.5 13.5c0 3.8 3.2 6.5 7.5 6.5s7.5-2.7 7.5-6.5c0-2.5-.7-4.3-2.2-6-1.1-1.2-1.8-2.5-1.8-4" />
      {/* Họa tiết hoa văn men gốm */}
      <path d="M6 13c1.8 1.2 10.2 1.2 12 0" />
      <path d="M7.5 16c1.5.8 7.5.8 9 0" />
      {/* Chân đế bình */}
      <path d="M9 20h6" />
      <path d="M9.5 20v1.5h5V20" />
    </svg>
  );
}
