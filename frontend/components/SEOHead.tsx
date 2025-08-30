import Head from 'next/head';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
}

export default function SEOHead({
  title,
  description,
  keywords = 'finnextho, finanças pessoais, gestão financeira, investimentos, controle financeiro, planejamento financeiro',
  canonical,
  ogImage = 'https://finnextho.com/og-image.jpg',
  ogType = 'website',
  noindex = false
}: SEOHeadProps) {
  const fullTitle = `${title} | FinNEXTHO - Gestão Financeira Inteligente`;
  const url = canonical ? `https://finnextho.com${canonical}` : 'https://finnextho.com';

  return (
    <Head>
      {/* Title e Description */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Robots */}
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      <meta name="googlebot" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="FinNEXTHO" />
      <meta property="og:locale" content="pt_BR" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": title,
            "description": description,
            "url": url,
            "publisher": {
              "@type": "Organization",
              "name": "FinNEXTHO",
              "url": "https://finnextho.com",
              "logo": {
                "@type": "ImageObject",
                "url": "https://finnextho.com/logo.png"
              }
            }
          })
        }}
      />
    </Head>
  );
}
