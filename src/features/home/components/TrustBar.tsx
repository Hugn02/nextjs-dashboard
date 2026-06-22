const TRUST_BADGES = [
  { icon: "🏆", text: "Thương hiệu sứ cao cấp số 1 Nhật Bản" },
  { icon: "🎁", text: "Hỗ trợ gói quà miễn phí" },
  { icon: "🛡️", text: "Bảo hành bể vỡ khi vận chuyển" },
  { icon: "🚚", text: "Giao hàng toàn quốc" },
];

export default function TrustBar() {
  return (
    <div className="hidden md:block bg-[#fdf8ef] border-y border-[#e8d9bb] overflow-hidden">
      <div className="flex whitespace-nowrap animate-[marquee_18s_linear_infinite]">
        {[...TRUST_BADGES, ...TRUST_BADGES].map((b, i) => (
          <div
            key={i}
            className="inline-flex items-center gap-2 px-10 py-3 text-[13px] text-[#5a3e00] font-['Cormorant_Garamond',_serif] tracking-[0.5px] border-r border-[#e8d9bb]"
          >
            <span className="text-base">{b.icon}</span>
            {b.text}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
