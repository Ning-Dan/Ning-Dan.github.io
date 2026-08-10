'use client';

import { useLocaleStore } from '@/lib/stores/localeStore';
import { useMessages } from '@/lib/i18n/useMessages';

interface FooterProps {
  lastUpdated?: string;
  lastUpdatedByLocale?: Record<string, string | undefined>;
  defaultLocale?: string;
}

export default function Footer({ lastUpdated, lastUpdatedByLocale, defaultLocale = 'en' }: FooterProps) {
  const locale = useLocaleStore((state) => state.locale);
  const messages = useMessages();

  const resolvedLastUpdated =
    lastUpdatedByLocale?.[locale] ||
    (defaultLocale ? lastUpdatedByLocale?.[defaultLocale] : undefined) ||
    lastUpdated ||
    new Date().toLocaleDateString(locale || 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-identity">
          <span aria-hidden="true">RN / 26</span>
          <div>
            <strong>Robotics Notebook</strong>
            <p>原理、实验与真实系统边界的长期技术笔记。</p>
          </div>
        </div>
        <div className="site-footer-meta">
          <span>LAST UPDATED · {resolvedLastUpdated}</span>
          <a href="https://github.com/xyjoey/PRISM" target="_blank" rel="noopener noreferrer">
            {messages.footer.builtWithPrism} ↗
          </a>
        </div>
      </div>
    </footer>
  );
}
