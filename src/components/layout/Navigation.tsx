'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import LanguageToggle from '@/components/ui/LanguageToggle';
import type { SiteConfig } from '@/lib/config';
import { useLocaleStore } from '@/lib/stores/localeStore';
import { useMessages } from '@/lib/i18n/useMessages';
import type { I18nRuntimeConfig } from '@/types/i18n';

interface NavigationProps {
  items: SiteConfig['navigation'];
  siteTitle: string;
  enableOnePageMode?: boolean;
  i18n: I18nRuntimeConfig;
  itemsByLocale?: Record<string, SiteConfig['navigation']>;
  siteTitleByLocale?: Record<string, string>;
}

export default function Navigation({
  items,
  siteTitle,
  enableOnePageMode,
  i18n,
  itemsByLocale,
  siteTitleByLocale,
}: NavigationProps) {
  const pathname = usePathname();
  const locale = useLocaleStore((state) => state.locale);
  const [scrolled, setScrolled] = useState(false);
  const [activeHash, setActiveHash] = useState('');
  const visibleSections = useRef(new Set<string>());
  const messages = useMessages();
  const resolvedLocale = i18n.enabled ? locale : i18n.defaultLocale;

  const effectiveItems = useMemo(
    () => itemsByLocale?.[resolvedLocale] || itemsByLocale?.[i18n.defaultLocale] || items,
    [i18n.defaultLocale, items, itemsByLocale, resolvedLocale]
  );

  const effectiveSiteTitle = useMemo(
    () => siteTitleByLocale?.[resolvedLocale] || siteTitleByLocale?.[i18n.defaultLocale] || siteTitle,
    [i18n.defaultLocale, resolvedLocale, siteTitle, siteTitleByLocale]
  );

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!enableOnePageMode) return;

    setActiveHash(window.location.hash);
    const handleHashChange = () => setActiveHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    visibleSections.current.clear();

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visibleSections.current.add(entry.target.id);
        else visibleSections.current.delete(entry.target.id);
      });
      const firstVisible = effectiveItems.find(
        (item) => item.type === 'page' && visibleSections.current.has(item.target)
      );
      if (firstVisible) setActiveHash(firstVisible.target === 'about' ? '' : `#${firstVisible.target}`);
    }, { rootMargin: '-20% 0px -60% 0px', threshold: 0 });

    effectiveItems.forEach((item) => {
      if (item.type !== 'page') return;
      const element = document.getElementById(item.target);
      if (element) observer.observe(element);
    });

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      observer.disconnect();
    };
  }, [enableOnePageMode, effectiveItems]);

  const itemHref = (item: SiteConfig['navigation'][number]) =>
    enableOnePageMode ? `/#${item.target}` : item.href;

  const itemIsActive = (item: SiteConfig['navigation'][number]) =>
    enableOnePageMode
      ? activeHash === `#${item.target}` || (!activeHash && item.target === 'about')
      : item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

  return (
    <Disclosure as="nav" className="site-navigation fixed inset-x-0 top-0 z-50">
      {({ open }) => (
        <>
          <div className={cn('navigation-surface', scrolled && 'is-scrolled')}>
            <div className="navigation-inner">
              <Link href="/" className="navigation-brand" aria-label={`${effectiveSiteTitle} 首页`}>
                <span className="navigation-brand-mark" aria-hidden="true"><i /><i /><i /></span>
                <span><strong>{effectiveSiteTitle}</strong><small>ROBOTICS FIELD NOTES</small></span>
              </Link>

              <div className="navigation-desktop">
                <div className="navigation-links" aria-label={messages.navigation.openMainMenu}>
                  {effectiveItems.map((item) => {
                    const href = itemHref(item);
                    const active = itemIsActive(item);
                    return (
                      <Link
                        key={item.target}
                        href={href}
                        prefetch
                        aria-current={active ? 'page' : undefined}
                        onClick={() => enableOnePageMode && setActiveHash(`#${item.target}`)}
                        className={cn('navigation-link', active && 'is-active')}
                      >
                        {item.title}
                      </Link>
                    );
                  })}
                </div>
                <LanguageToggle i18n={i18n} />
              </div>

              <div className="navigation-mobile-actions">
                <LanguageToggle i18n={i18n} />
                <Disclosure.Button className="navigation-menu-button">
                  <span className="sr-only">{messages.navigation.openMainMenu}</span>
                  {open ? <XMarkIcon aria-hidden="true" /> : <Bars3Icon aria-hidden="true" />}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="navigation-mobile-panel">
            {effectiveItems.map((item) => {
              const href = itemHref(item);
              const active = itemIsActive(item);
              return (
                <Disclosure.Button
                  as={Link}
                  key={item.target}
                  href={href}
                  prefetch
                  aria-current={active ? 'page' : undefined}
                  onClick={() => enableOnePageMode && setActiveHash(`#${item.target}`)}
                  className={cn('navigation-mobile-link', active && 'is-active')}
                >
                  <span>{item.title}</span><i aria-hidden="true">→</i>
                </Disclosure.Button>
              );
            })}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
