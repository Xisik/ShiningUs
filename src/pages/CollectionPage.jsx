import { useCallback, useMemo } from 'react';
import { useLanguage } from '../state/LanguageContext.jsx';
import { toHash } from '../router/useHashRoute.js';
import { useJsonResource } from '../hooks/useJsonResource.js';
import {
  createGeneratedSrcSet,
  formatDate,
  getCollectionConfig,
  markdownToHtml,
  normalizeItems,
  normalizePayload
} from '../lib/content.js';

function normalizeCollection(payload, type) {
  const config = getCollectionConfig(type);
  const normalized = normalizePayload(payload, config.payloadKey);
  return {
    items: normalizeItems(normalized.items),
    metadata: normalized.metadata
  };
}

function DetailImage({ item }) {
  if (!item.image) return null;
  const src = item.image.startsWith('./') ? item.image : `./${item.image.replace(/^\/+/, '')}`;
  const srcSet = createGeneratedSrcSet(src);

  return (
    <figure className="activity-image">
      <picture>
        {srcSet && (
          <source
            type="image/webp"
            srcSet={srcSet}
            sizes="(max-width: 960px) 100vw, 960px"
          />
        )}
        <img
          className="activity-detail-image"
          src={src}
          alt={item.title}
          loading="lazy"
          decoding="async"
        />
      </picture>
    </figure>
  );
}

function CollectionItem({ item, config, language, t }) {
  return (
    <article className="card activity-card">
      <header className="activity-header">
        <h2 className="activity-title">
          <a className="activity-link" href={toHash(`${config.route}/${item.slug}`)}>
            {item.title}
          </a>
        </h2>
        {item.date && <time className="activity-date">{formatDate(item.date, language === 'en' ? 'en-US' : 'ko-KR')}</time>}
      </header>
      {item.summary && <p className="activity-summary">{item.summary}</p>}
      <a className="btn btn-primary" href={toHash(`${config.route}/${item.slug}`)}>
        {t('readMore')}
      </a>
    </article>
  );
}

function CollectionList({ config, items }) {
  const { t, language } = useLanguage();
  const title = t(config.titleKey) || config.title;

  if (!items.length) {
    return (
      <section className="activities-container" role="region" aria-label={title}>
        <article className="card content">
          <h2>{t('empty')}</h2>
        </article>
      </section>
    );
  }

  return (
    <section className="activities-container" role="region" aria-label={title}>
      {items.map((item, index) => (
        <CollectionItem
          key={`${item.slug}-${index}`}
          item={item}
          config={config}
          language={language}
          t={t}
        />
      ))}
    </section>
  );
}

function CollectionDetail({ config, items, slug }) {
  const { t, language } = useLanguage();
  const item = items.find((candidate) => candidate.slug === slug);

  if (!item) {
    return (
      <main className="container">
        <section className="page-header">
          <h1>{t('notFound')}</h1>
          <p><a className="btn btn-primary" href={toHash(config.route)}>{t('backToList')}</a></p>
        </section>
      </main>
    );
  }

  return (
    <main className="container">
      <article className="activity-detail">
        <header className="activity-detail-header">
          <p className="activity-detail-meta">
            {item.category && <span className="activity-category">{item.category}</span>}
            {item.date && <time className="activity-detail-date">{formatDate(item.date, language === 'en' ? 'en-US' : 'ko-KR')}</time>}
          </p>
          <h1 className="activity-detail-title">{item.title}</h1>
          {item.summary && <p className="activity-detail-summary">{item.summary}</p>}
        </header>

        <DetailImage item={item} />

        <div
          className="activity-detail-body content"
          dangerouslySetInnerHTML={{ __html: markdownToHtml(item.body || item.summary) }}
        />

        <footer className="activity-detail-footer">
          <a className="btn btn-primary" href={toHash(config.route)}>{t('backToList')}</a>
        </footer>
      </article>
    </main>
  );
}

export function CollectionPage({ type, slug }) {
  const { t } = useLanguage();
  const config = getCollectionConfig(type);
  const normalize = useCallback((payload) => normalizeCollection(payload, type), [type]);
  const { status, data, error, cached } = useJsonResource(
    config.dataUrl,
    `shiningus:${type}-json:v2`,
    normalize
  );
  const items = useMemo(() => data?.items || [], [data]);

  if (status === 'loading') {
    const title = t(config.titleKey) || config.title;
    const description = t(config.descriptionKey) || config.description;
    return (
      <main className="container">
        <section className="page-header">
          <h1>{title}</h1>
          <p>{description}</p>
        </section>
        <section className="activities-container">
          <div className="card content loading-state" role="status" aria-live="polite">
            <p className="loading-title">{t('loading')}</p>
          </div>
        </section>
      </main>
    );
  }

  if (status === 'error') {
    const title = t(config.titleKey) || config.title;
    return (
      <main className="container">
        <section className="page-header">
          <h1>{title}</h1>
          <p>{error?.message || t('notFound')}</p>
        </section>
      </main>
    );
  }

  if (slug) {
    return <CollectionDetail config={config} items={items} slug={slug} />;
  }

  const title = t(config.titleKey) || config.title;
  const description = t(config.descriptionKey) || config.description;

  return (
    <main className="container">
      <section className="page-header">
        <h1>{title}</h1>
        <p>{description}</p>
        {cached && <p className="small">cached</p>}
      </section>
      <CollectionList config={config} items={items} />
    </main>
  );
}
