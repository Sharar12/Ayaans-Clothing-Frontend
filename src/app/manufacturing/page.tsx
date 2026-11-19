import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { VideoBackground } from "@/design-system/primitives";

const STEPS = [
  { num: "01", title: "Tech Pack & Fabric Sourcing", desc: "Submit your specs or choose from our 600+ mill-direct organic cotton, denim, and performance fabrics." },
  { num: "02", title: "Proto & Fit Sampling", desc: "7–10 day rapid prototyping with custom trims, woven labels, and embroidery." },
  { num: "03", title: "Bulk Production & AQL QC", desc: "ISO 9001:2015 compliant manufacturing lines with inline and final AQL 2.5 inspection." },
  { num: "04", title: "Global Export Freight", desc: "Complete export documentation (GSP, CO, Packing List) via Chittagong Sea Port or Dhaka Air Cargo." },
];

export default function ManufacturingPage() {
  return (
    <div className="relative min-h-screen bg-white">
      <VideoBackground
        src="/bg_videos/create_a_loop_bg_video_with_th.mp4"
        topOnly
        height="380px"
        opacity={0.33}
      />
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
      <div className="max-w-3xl pb-12 border-b border-hairline">
        <span className="font-mono text-xs uppercase text-muted">Private Label • MOQ 500+ PCS</span>
        <h1 className="font-display font-bold text-4xl sm:text-5xl text-ink mt-2">
          Custom OEM Garment Manufacturing
        </h1>
        <p className="text-base text-muted mt-4 leading-relaxed">
          From streetwear hoodies to fine-gauge knitwear, Ayaan Clothing manages the entire supply chain across 600+ compliant factories in Bangladesh.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 py-16">
        {STEPS.map((s) => (
          <div key={s.num} className="p-6 border border-hairline bg-surface/40">
            <span className="font-mono text-xs text-muted">{s.num}</span>
            <h3 className="font-display font-bold text-lg text-ink mt-3">{s.title}</h3>
            <p className="text-sm text-muted mt-2 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="p-10 border border-ink bg-white flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="font-display font-bold text-2xl text-ink">Ready to start your custom line?</h3>
          <p className="text-sm text-muted mt-1">Send your tech pack or garment reference to our merchandising desk.</p>
        </div>
        <Link
          href="/rfq"
          className="px-7 py-4 bg-ink text-white text-xs font-medium uppercase tracking-wider flex items-center gap-2 hover:bg-neutral-800 transition-colors"
        >
          Submit Tech Pack <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
    </div>
  );
}
