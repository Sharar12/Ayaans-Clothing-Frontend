import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Bell } from 'lucide-react';
import { api } from '@/services/api';
import { ProductCard } from '@/components/commerce/ProductCard';
import { AmbientAura, PrismaticButton, SpecBadge, VideoBackground } from '@/design-system/primitives';

export default async function BrandDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { brand, products } = await api.getBrandBySlug(slug);

  if (!brand) {
    return (
      <div className="mx-auto max-w-xl px-4 py-28 text-center">
        <p className="font-mono text-xs text-[#6E6E73]">BRAND NOT LISTED</p>
        <h1 className="mt-2 text-2xl font-semibold text-[#0A0B0E]">Request Sourcing Across 600+ Factories</h1>
        <p className="mt-2 text-sm text-[#515154]">
          Many surplus brand shipments rotate daily and are allocated privately via our Dhaka merchandisers.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/brands">
            <PrismaticButton variant="glass">All Brands</PrismaticButton>
          </Link>
          <Link href="/rfq">
            <PrismaticButton>Request Sourcing</PrismaticButton>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white pb-24">
      <VideoBackground
        src="/bg_videos/generated_video_july_24.mp4"
        topOnly
        height="380px"
        opacity={0.33}
      />
      <AmbientAura variant="subtle" />

      <div className="relative mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        <Link href="/brands" className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6E6E73] hover:text-[#0A0B0E]">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Brands Directory
        </Link>

        <div className="mt-6 flex flex-col justify-between gap-6 rounded-[30px] border border-black/[0.06] bg-[#FAFAFC] p-8 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <SpecBadge tone={brand.isOwnLabel ? 'original' : 'emerald'}>
                {brand.isOwnLabel ? 'Flagship House Line' : `${brand.activeLots} Lots Sourced Weekly`}
              </SpecBadge>
              <span className="font-mono text-xs text-[#6E6E73]">{brand.origin}</span>
            </div>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-[#0A0B0E]">{brand.name}</h1>
            <p className="mt-1.5 text-sm text-[#515154]">{brand.specialty}</p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link href={`/rfq?brand=${encodeURIComponent(brand.name)}`}>
              <PrismaticButton prismatic>
                <Bell className="h-3.5 w-3.5" /> Get {brand.name} Stock Alerts
              </PrismaticButton>
            </Link>
            <Link href="/catalog">
              <PrismaticButton variant="glass">All Catalog Lots</PrismaticButton>
            </Link>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="mb-6 text-lg font-semibold text-[#0A0B0E]">
            Active Warehouse Lots ({products.length})
          </h2>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.sku} product={p} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-black/[0.06] bg-[#FAFAFC] p-12 text-center">
              <p className="text-base font-semibold text-[#0A0B0E]">
                Fresh {brand.name} lots are currently staged for private buyer allocation.
              </p>
              <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-[#6E6E73]">
                Submit your required quantities and categories—our Dhaka merchandisers will share today&apos;s off-market
                stock sheets and warehouse inspection videos within 4–12 hours.
              </p>
              <Link href="/rfq" className="mt-6 inline-block">
                <PrismaticButton>
                  Request {brand.name} Stock Sheet <ArrowRight className="h-4 w-4" />
                </PrismaticButton>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
