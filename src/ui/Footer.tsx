import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-white border-t border-hairline pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-16 border-b border-hairline">
          <div className="md:col-span-2">
            <span className="font-display font-bold text-xl tracking-tight text-ink">
              AYAAN CLOTHING
            </span>
            <p className="text-sm text-muted mt-3 max-w-sm leading-relaxed">
              ISO 9001:2015 certified RMG Manufacturer, Buying House & Export Stock Lot Wholesaler in Dhaka, Bangladesh. Supplying global retail chains since 2010.
            </p>
            <div className="flex gap-3 mt-6 font-mono text-[11px] text-ink">
              <span className="px-2.5 py-1 border border-hairline bg-surface">ISO 9001:2015</span>
              <span className="px-2.5 py-1 border border-hairline bg-surface">BGMEA Member</span>
              <span className="px-2.5 py-1 border border-hairline bg-surface">600+ Factories</span>
            </div>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-ink mb-4">
              Sourcing
            </h4>
            <ul className="space-y-2.5 text-sm text-muted">
              <li><Link href="/shop" className="hover:text-ink">Wholesale Catalog</Link></li>
              <li><Link href="/stock-lots" className="hover:text-ink">Ready Stock Lots</Link></li>
              <li><Link href="/manufacturing" className="hover:text-ink">OEM Manufacturing</Link></li>
              <li><Link href="/brands" className="hover:text-ink">Brands Directory</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-ink mb-4">
              Export Desk
            </h4>
            <ul className="space-y-2.5 text-sm text-muted">
              <li><Link href="/about" className="hover:text-ink">About & Compliance</Link></li>
              <li><Link href="/rfq" className="hover:text-ink">Request Quotation</Link></li>
              <li><Link href="/contact" className="hover:text-ink">Uttara, Dhaka HQ</Link></li>
              <li className="font-mono text-xs text-ink pt-2">export@ayaanclothing.com</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-muted font-mono">
          <p>© {new Date().getFullYear()} Ayaan Clothing. All rights reserved.</p>
          <p>Dhaka, Bangladesh — Global Apparel Export</p>
        </div>
      </div>
    </footer>
  );
}
