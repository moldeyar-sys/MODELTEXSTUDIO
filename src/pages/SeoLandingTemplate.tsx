import { ArrowRight, CheckCircle2, FileText } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FloatingPatterns } from '../components/ui/FloatingPatterns';
import { useSeo, useStructuredData } from '../lib/seo';

type LandingSection = {
  title: string;
  text: string;
  href: string;
  cta: string;
  icon: LucideIcon;
};

type LandingConfig = {
  path: string;
  title: string;
  description: string;
  heroTitle: string;
  heroText: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  benefitsTitle: string;
  benefitsIntro: string;
  benefits: string[];
  sections: LandingSection[];
  schemaName: string;
};

export function SeoLandingTemplate({
  path,
  title,
  description,
  heroTitle,
  heroText,
  primaryCta,
  secondaryCta,
  benefitsTitle,
  benefitsIntro,
  benefits,
  sections,
  schemaName,
}: LandingConfig) {
  useSeo({ title, description, path });

  useStructuredData(
    [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: title,
        url: `https://modeltex.com.ar${path}`,
        description,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://modeltex.com.ar/' },
          { '@type': 'ListItem', position: 2, name: schemaName, item: `https://modeltex.com.ar${path}` },
        ],
      },
    ],
    `${schemaName.toLowerCase().replace(/\s+/g, '-')}-schema`,
  );

  return (
    <div className="min-h-screen bg-petroleum-50">
      <section className="relative overflow-hidden bg-white border-b border-gray-100">
        <FloatingPatterns variant="dark" />
        <div className="container-custom py-10 sm:py-14">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-800">
              <FileText className="w-4 h-4" /> SEO landing
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-primary-900 mt-5 leading-tight">
              {heroTitle}
            </h1>
            <p className="text-base sm:text-lg text-gray-600 mt-4 max-w-3xl leading-relaxed">{heroText}</p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link to={primaryCta.href} className="btn-primary inline-flex items-center gap-2">
                {primaryCta.label} <ArrowRight className="w-4 h-4" />
              </Link>
              {secondaryCta && (
                <Link to={secondaryCta.href} className="btn-secondary inline-flex items-center gap-2">
                  {secondaryCta.label}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container-custom py-8 sm:py-10">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-6 items-start">
          <div className="card p-6 sm:p-7">
            <h2 className="font-display text-2xl font-bold text-primary-900">{benefitsTitle}</h2>
            <p className="text-gray-600 mt-3 leading-relaxed">{benefitsIntro}</p>
            <div className="mt-5 space-y-3">
              {benefits.map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-primary-700 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <div key={section.title} className="card p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary-900 text-lg">{section.title}</h3>
                      <p className="text-gray-600 mt-2 leading-relaxed">{section.text}</p>
                      <Link to={section.href} className="inline-flex items-center gap-2 text-sm font-medium text-primary-700 hover:text-primary-900 mt-4">
                        {section.cta} <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
