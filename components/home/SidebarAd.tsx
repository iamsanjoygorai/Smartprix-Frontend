export default function SidebarAd() {
  return (
    <aside className="min-h-[220px] rounded-md border border-slate-200 bg-white p-2">
      <div className="flex h-[172px] flex-col justify-between bg-gradient-to-br from-[#1b2d60] via-[#4f5d99] to-[#9d9fbd] p-6 text-right text-xs text-white">
        <b className="text-left text-4xl tracking-widest text-white/65">FOLD</b>
        <span>The all-new Galaxy Z Fold8<br />Starting at ₹1,39,999</span>
      </div>
      <p className="pt-2 text-sm font-bold text-slate-900">₹7000 instant bank discount</p>
    </aside>
  );
}
