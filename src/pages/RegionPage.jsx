import { useState } from 'react';
import { branches } from '../data/branches.js';
import { useLanguage } from '../state/LanguageContext.jsx';

const branchNameKeys = {
  'busan-ulsan-gyeongnam': 'busanBranch',
  'gwangju-jeonnam': 'gwangjuBranch',
  'seoul-gyeonggi': 'seoulBranch',
  chungcheong: 'chungcheongBranch'
};

const contactNameKeys = {
  '\uAE08\uAC15': 'geumgang',
  '\uC11C\uC601': 'seoyoung',
  '\uD61C\uC740': 'hyeeun',
  '\uC7AC\uD604': 'jaehyun'
};

function translateLinkLabel(label, t) {
  if (label === '\uD2B8\uC704\uD130') return t('twitter');
  if (label === '\uC778\uC2A4\uD0C0\uADF8\uB7A8') return t('instagram');
  return label;
}

function translateContactLabel(label, t) {
  if (label === '\uC774\uBA54\uC77C') return t('email');
  const representative = label.match(/^\uB300\uD45C\s+(.+)$/);
  if (!representative) return label;
  const nameKey = contactNameKeys[representative[1]];
  return nameKey ? `${t('representative')} ${t(nameKey)}` : `${t('representative')} ${representative[1]}`;
}

function RegionBranchCard({ branch, isOpen, setOpenIds, t }) {
  const panelId = `branch-${branch.id}`;
  const rawTitle = t(branchNameKeys[branch.id]) || branch.name;

  return (
    <article className="region-branch-card">
      <button
        type="button"
        className="region-branch-header"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setOpenIds((current) => (
          current.includes(branch.id)
            ? current.filter((id) => id !== branch.id)
            : [...current, branch.id]
        ))}
      >
        <span className="region-branch-name">{rawTitle}</span>
        <span className="region-branch-state" aria-hidden="true">
          {isOpen ? '-' : '+'}
        </span>
      </button>

      <div className="region-branch-links" aria-label={`${branch.name} SNS`}>
        {branch.links.map((link) => (
          <a className="link" href={link.href} target="_blank" rel="noopener noreferrer" key={link.href}>
            {translateLinkLabel(link.label, t)}
          </a>
        ))}
      </div>

      <div className={`region-branch-panel${isOpen ? ' is-open' : ''}`} id={panelId} hidden={!isOpen}>
        <div className="region-contact-list">
          {branch.contacts.map((contact) => (
            <div className="region-contact-item" key={`${contact.label}-${contact.value}`}>
              <span>{translateContactLabel(contact.label, t)}</span>
              <span>{contact.value}</span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

export function RegionPage() {
  const { t } = useLanguage();
  const [openIds, setOpenIds] = useState([]);

  return (
    <main className="container region-page">
      <section className="page-header">
        <h1>{t('regionIntroTitle')}</h1>
        <p>
          {t('regionIntroDescription')}
        </p>
      </section>

      <section className="card content region-branches" aria-labelledby="regionBranchTitle">
        <h2 id="regionBranchTitle">{t('regionBranchList')}</h2>

        <div className="region-branch-grid">
          {branches.map((branch) => (
            <RegionBranchCard
              key={branch.id}
              branch={branch}
              isOpen={openIds.includes(branch.id)}
              setOpenIds={setOpenIds}
              t={t}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
