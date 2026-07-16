import { useLayoutEffect, useRef, useState } from 'react';
import { useLanguage } from '../state/LanguageContext.jsx';

const BYLAWS_URL = 'https://www.notion.so/30723dec97d58037be47f196f5d70882?source=copy_link';

const copy = {
  ko: {
    title: '조직도',
    intro: '빛나는우리청소년성소수자모임의 의결·운영·실무 조직과 공개 연락처를 안내합니다.',
    overviewTitle: '단체 개요',
    officialName: '공식 명칭',
    officialNameValue: '빛나는우리청소년성소수자모임',
    englishName: '영문 명칭',
    englishNameValue: 'Shining Us: LGBTQ+ Youth Association',
    organizationType: '단체 형태',
    organizationTypeValue: '법인으로 보는 단체',
    transition: '법인 전환',
    transitionValue: '2026년 4월 4일 총회에서 사단법인 전환을 의결했으며, 재산·계약 등의 이전 절차를 진행하도록 정하고 있습니다.',
    office: '주된 사무소',
    officeValue: '대한민국 순천시',
    purpose: '목적',
    purposeValue: '청소년 성소수자의 인권 증진과 안전한 성장 환경을 조성하고, 차별과 혐오 없는 사회의 실현에 기여합니다.',
    businessesTitle: '주요 사업',
    businesses: [
      '청소년 성소수자 인권 옹호 및 권익 증진 활동',
      '상담, 정서적 지지 및 또래 네트워크 구축',
      '교육·연구·캠페인 및 인식 개선 사업',
      '청소년 인권, 성평등, 다양성 관련 정책 제안 및 공론화',
      '관련 단체 및 기관과의 연대·협력',
      '단체 후원을 위한 상품 판매'
    ],
    bylawsLink: '정관 원문 보기',
    structureTitle: '조직 구조',
    structureDescription: '정관에 따라 총회를 중심으로 이사회가 주요 사항을 심의·의결하고, 사무국과 지역지부가 실무와 지역 활동을 수행합니다.',
    chartLabel: '빛나는우리청소년성소수자모임 조직도',
    assembly: '총회',
    assemblyDescription: '정회원 및 준회원으로 구성되며 정관, 임원, 사업 계획, 예산·결산 등 주요 사항을 의결합니다.',
    board: '이사회',
    boardDescription: '총회에서 위임한 사항과 단체 운영의 중요 사항을 심의·의결합니다.',
    boardRoles: [
      ['대표', '서영'],
      ['부대표', '금강'],
      ['이사', '예명']
    ],
    secretariat: '사무국',
    secretariatDescription: '단체의 사무 업무 전반을 담당합니다. 선출직 임원과 운영위원이 업무별 팀을 구성해 활동합니다.',
    headquarters: [
      {
        name: '운영기획본부',
        teams: ['IT팀', '정치사회팀', '운영지원팀', '인권상담팀', '기획조직팀']
      },
      {
        name: '대외소통본부',
        teams: ['웨이브팀', '디자인팀', '홍보소통팀', '긴급대응팀']
      }
    ],
    regionalBranches: '지역지부',
    regionalDescription: '각 지부는 내부 조직과 운영을 자치적으로 결정하며, 지역회원 투표로 지부장을 선출합니다.',
    branchHead: '지부장',
    branchOffice: '지부사무소',
    branches: [
      ['부울경지부', '금강', '경상남도 창원시 마산합포구'],
      ['전남광주통합특별시지부', '서영', '대한민국 순천시(주된 사무소와 동일)'],
      ['충청지부', '재현', '충청남도 천안시'],
      ['서울경기지부', '혜은', '서울특별시']
    ],
    contactsTitle: '조직 연락처',
    contactsDescription: '문의 유형에 맞는 연락처를 선택해 주세요.',
    contacts: [
      ['대표메일', 'jenaeon3@gmail.com', 'mailto:jenaeon3@gmail.com'],
      ['사무국 웨이브팀 / 홍보소통팀', 'shinelgbtqkr@naver.com', 'mailto:shinelgbtqkr@naver.com'],
      ['사무국 기획조직팀 / 운영지원팀', 'shinelgbtqkr@proton.me', 'mailto:shinelgbtqkr@proton.me'],
      ['전남광주통합특별시지부', 'ysgrainbow@gmail.com', 'mailto:ysgrainbow@gmail.com'],
      ['일반문의', '070-7953-8302', 'tel:070-7953-8302'],
      ['대표·전남광주통합특별시지부장 서영', '010-4930-5488', 'tel:010-4930-5488'],
      ['부대표·부울경지부장 금강', '010-3008-6245', 'tel:010-3008-6245'],
      ['서울경기지부장 혜은', '010-9716-5013', 'tel:010-9716-5013'],
      ['충청지부장 재현', '010-5026-6787', 'tel:010-5026-6787']
    ]
  },
  en: {
    title: 'Organization Structure',
    intro: 'Learn about the governance, operations, working structure, and public contacts of Shining Us.',
    overviewTitle: 'Organization Overview',
    officialName: 'Official Korean name',
    officialNameValue: '빛나는우리청소년성소수자모임',
    englishName: 'Official English name',
    englishNameValue: 'Shining Us: LGBTQ+ Youth Association',
    organizationType: 'Organization type',
    organizationTypeValue: 'An organization treated as a corporation for legal purposes',
    transition: 'Incorporation transition',
    transitionValue: 'The General Assembly resolved on April 4, 2026 to transition into an incorporated association and established a process for transferring property and contracts.',
    office: 'Principal office',
    officeValue: 'Suncheon, Republic of Korea',
    purpose: 'Purpose',
    purposeValue: 'To advance the human rights of LGBTQ youth, foster safe environments for their growth, and help build a society free from discrimination and hate.',
    businessesTitle: 'Main Activities',
    businesses: [
      'Advocacy and rights advancement for LGBTQ youth',
      'Counseling, emotional support, and peer-network building',
      'Education, research, campaigns, and public awareness',
      'Policy proposals and public discussion on youth rights, gender equality, and diversity',
      'Solidarity and cooperation with related organizations and institutions',
      'Merchandise sales that support the organization'
    ],
    bylawsLink: 'View full bylaws',
    structureTitle: 'Organizational Structure',
    structureDescription: 'Under the bylaws, the General Assembly is the central decision-making body, the Board deliberates and decides major matters, and the Secretariat and Regional Branches carry out operational and local work.',
    chartLabel: 'Shining Us organizational chart',
    assembly: 'General Assembly',
    assemblyDescription: 'Composed of full and associate members, it decides major matters including the bylaws, officers, business plans, budgets, and settlements.',
    board: 'Board of Directors',
    boardDescription: 'Deliberates and decides matters delegated by the General Assembly and other major operational matters.',
    boardRoles: [
      ['Representative', 'Seo-young'],
      ['Vice Representative', 'Geumgang'],
      ['Director', 'Ye-myeong']
    ],
    secretariat: 'Secretariat',
    secretariatDescription: 'Handles the organization’s administrative work. Elected officers and operating committee members form teams based on their responsibilities.',
    headquarters: [
      {
        name: 'Operations & Planning Division',
        teams: ['IT Team', 'Political & Social Affairs Team', 'Operations Support Team', 'Human Rights Counseling Team', 'Planning & Organizing Team']
      },
      {
        name: 'External Communications Division',
        teams: ['Wave Team', 'Design Team', 'PR & Communications Team', 'Emergency Response Team']
      }
    ],
    regionalBranches: 'Regional Branches',
    regionalDescription: 'Each branch determines its internal organization and operations autonomously, and regional members elect a branch head.',
    branchHead: 'Branch head',
    branchOffice: 'Branch office',
    branches: [
      ['Busan-Ulsan-Gyeongnam Branch', 'Geumgang', 'Masan Happo-gu, Changwon, Gyeongsangnam-do'],
      ['Jeonnam-Gwangju Integrated Special City Branch', 'Seo-young', 'Suncheon (same as the principal office)'],
      ['Chungcheong Branch', 'Jae-hyun', 'Cheonan, Chungcheongnam-do'],
      ['Seoul-Gyeonggi Branch', 'Hye-eun', 'Seoul']
    ],
    contactsTitle: 'Organization Contacts',
    contactsDescription: 'Choose the contact that best matches your inquiry.',
    contacts: [
      ['Main email', 'jenaeon3@gmail.com', 'mailto:jenaeon3@gmail.com'],
      ['Secretariat Wave Team / PR & Communications Team', 'shinelgbtqkr@naver.com', 'mailto:shinelgbtqkr@naver.com'],
      ['Secretariat Planning & Organizing Team / Operations Support Team', 'shinelgbtqkr@proton.me', 'mailto:shinelgbtqkr@proton.me'],
      ['Jeonnam-Gwangju Integrated Special City Branch', 'ysgrainbow@gmail.com', 'mailto:ysgrainbow@gmail.com'],
      ['General inquiries', '070-7953-8302', 'tel:070-7953-8302'],
      ['Representative & Jeonnam-Gwangju branch head Seo-young', '010-4930-5488', 'tel:010-4930-5488'],
      ['Vice Representative & Busan-Ulsan-Gyeongnam branch head Geumgang', '010-3008-6245', 'tel:010-3008-6245'],
      ['Seoul-Gyeonggi branch head Hye-eun', '010-9716-5013', 'tel:010-9716-5013'],
      ['Chungcheong branch head Jae-hyun', '010-5026-6787', 'tel:010-5026-6787']
    ]
  }
};

function OverviewItem({ label, children }) {
  return (
    <div className="organization-overview-item">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function OrganizationNode({ className = '', title, description, children }) {
  return (
    <article className={`organization-node${className ? ` ${className}` : ''}`}>
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </article>
  );
}

function readCssLength(element, propertyName, fallback) {
  const rawValue = getComputedStyle(element).getPropertyValue(propertyName).trim();
  const value = Number.parseFloat(rawValue);

  if (!Number.isFinite(value)) return fallback;
  if (rawValue.endsWith('rem')) {
    return value * Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
  }
  if (rawValue.endsWith('em')) {
    return value * Number.parseFloat(getComputedStyle(element).fontSize);
  }
  return value;
}

function measureBranchConnector(group) {
  const list = Array.from(group.children).find((child) => child.classList.contains('organization-tree-child-list'));
  if (!list) return null;

  const children = Array.from(list.children).filter((child) => child.classList.contains('organization-tree-child'));
  const groupRect = group.getBoundingClientRect();
  if (!children.length || !groupRect.width || !groupRect.height) return null;

  const pixelRatio = window.devicePixelRatio || 1;
  const snap = (value) => Math.round(value * pixelRatio) / pixelRatio;
  const anchorOffset = readCssLength(group, '--organization-tree-anchor', 20);
  const railIndent = readCssLength(group, '--organization-tree-rail-indent', 16);
  const targets = children.map((child) => {
    const target = child.firstElementChild || child;
    const rect = target.getBoundingClientRect();
    return {
      anchorY: snap(rect.top - groupRect.top + Math.min(anchorOffset, rect.height / 2)),
      centerX: snap(rect.left - groupRect.left + rect.width / 2),
      left: snap(rect.left - groupRect.left),
      top: snap(rect.top - groupRect.top)
    };
  });

  const width = snap(groupRect.width);
  const height = snap(groupRect.height);
  const startX = snap(width / 2);
  const firstTop = Math.min(...targets.map((target) => target.top));
  const sameRow = targets.every((target) => Math.abs(target.top - firstTop) <= 2);
  const commands = [];

  if (targets.length === 1) {
    commands.push(`M ${startX} 0 V ${targets[0].top}`);
  } else if (sameRow) {
    const branchY = snap(firstTop / 2);
    const childCenters = targets.map((target) => target.centerX);
    commands.push(`M ${startX} 0 V ${branchY}`);
    commands.push(`M ${Math.min(...childCenters)} ${branchY} H ${Math.max(...childCenters)}`);
    targets.forEach((target) => commands.push(`M ${target.centerX} ${branchY} V ${target.top}`));
  } else {
    const railX = snap(Math.max(0, Math.min(...targets.map((target) => target.left)) - railIndent));
    const elbowY = snap(firstTop / 2);
    const lastAnchorY = Math.max(...targets.map((target) => target.anchorY));
    commands.push(`M ${startX} 0 V ${elbowY} H ${railX} V ${lastAnchorY}`);
    targets.forEach((target) => commands.push(`M ${railX} ${target.anchorY} H ${target.left}`));
  }

  return { height, path: commands.join(' '), width };
}

function TreeBranchGroup({ className = '', children }) {
  const groupRef = useRef(null);
  const [connector, setConnector] = useState(null);

  useLayoutEffect(() => {
    const group = groupRef.current;
    if (!group) return undefined;

    let animationFrame = 0;
    let disposed = false;
    const updateConnector = () => {
      if (disposed) return;
      const nextConnector = measureBranchConnector(group);
      setConnector((currentConnector) => {
        if (
          currentConnector?.path === nextConnector?.path
          && currentConnector?.width === nextConnector?.width
          && currentConnector?.height === nextConnector?.height
        ) {
          return currentConnector;
        }
        return nextConnector;
      });
    };
    const scheduleUpdate = () => {
      if (disposed) return;
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(updateConnector);
    };
    const resizeObserver = new ResizeObserver(scheduleUpdate);
    const list = Array.from(group.children).find((child) => child.classList.contains('organization-tree-child-list'));

    resizeObserver.observe(group);
    if (list) {
      resizeObserver.observe(list);
      Array.from(list.children).forEach((child) => {
        resizeObserver.observe(child);
        if (child.firstElementChild) resizeObserver.observe(child.firstElementChild);
      });
    }
    window.addEventListener('resize', scheduleUpdate);
    document.fonts?.ready.then(scheduleUpdate);
    updateConnector();

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, [children]);

  return (
    <div ref={groupRef} className={`organization-tree-branch-group${className ? ` ${className}` : ''}`}>
      {connector && (
        <svg
          className="organization-tree-connectors"
          viewBox={`0 0 ${connector.width} ${connector.height}`}
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <path d={connector.path} vectorEffect="non-scaling-stroke" />
        </svg>
      )}
      <ul className="organization-tree-child-list">
        {children}
      </ul>
    </div>
  );
}

function TreeChild({ className = '', children }) {
  return (
    <li className={`organization-tree-child${className ? ` ${className}` : ''}`}>
      {children}
    </li>
  );
}

export function OrganizationPage() {
  const { language } = useLanguage();
  const t = copy[language] || copy.ko;

  return (
    <main className="container organization-page">
      <section className="page-header">
        <h1>{t.title}</h1>
        <p>{t.intro}</p>
      </section>

      <section className="card content organization-overview" aria-labelledby="organizationOverviewTitle">
        <h2 id="organizationOverviewTitle">{t.overviewTitle}</h2>
        <dl className="organization-overview-list">
          <OverviewItem label={t.officialName}>{t.officialNameValue}</OverviewItem>
          <OverviewItem label={t.englishName}>{t.englishNameValue}</OverviewItem>
          <OverviewItem label={t.organizationType}>{t.organizationTypeValue}</OverviewItem>
          <OverviewItem label={t.transition}>{t.transitionValue}</OverviewItem>
          <OverviewItem label={t.office}>{t.officeValue}</OverviewItem>
          <OverviewItem label={t.purpose}>{t.purposeValue}</OverviewItem>
        </dl>

        <h3>{t.businessesTitle}</h3>
        <ul className="organization-business-list">
          {t.businesses.map((business) => <li key={business}>{business}</li>)}
        </ul>

        <a className="btn btn-primary organization-bylaws-link" href={BYLAWS_URL} target="_blank" rel="noopener noreferrer">
          {t.bylawsLink}
        </a>
      </section>

      <section className="card content organization-structure" aria-labelledby="organizationStructureTitle">
        <h2 id="organizationStructureTitle">{t.structureTitle}</h2>
        <p>{t.structureDescription}</p>

        <div className="organization-chart" aria-label={t.chartLabel}>
          <div className="organization-tree-root">
            <OrganizationNode title={t.assembly} description={t.assemblyDescription} />
          </div>

          <TreeBranchGroup className="organization-tree-single organization-tree-board">
            <TreeChild>
              <OrganizationNode title={t.board} description={t.boardDescription}>
                <ul className="organization-role-list">
                  {t.boardRoles.map(([role, name]) => (
                    <li key={role}>
                      <strong>{role}</strong>
                      {name && <span>{name}</span>}
                    </li>
                  ))}
                </ul>
              </OrganizationNode>

              <TreeBranchGroup className="organization-tree-split organization-tree-divisions">
                <TreeChild className="organization-tree-division-item">
                  <OrganizationNode className="organization-division organization-secretariat" title={t.secretariat} description={t.secretariatDescription}>
                    <TreeBranchGroup className="organization-tree-split organization-tree-headquarters">
                      {t.headquarters.map((headquarters) => (
                        <TreeChild className="organization-tree-headquarters-item" key={headquarters.name}>
                          <section className="organization-headquarters">
                            <h4>{headquarters.name}</h4>
                            <TreeBranchGroup className="organization-tree-rail organization-tree-teams">
                              {headquarters.teams.map((team) => (
                                <TreeChild key={team}>
                                  <span className="organization-team">{team}</span>
                                </TreeChild>
                              ))}
                            </TreeBranchGroup>
                          </section>
                        </TreeChild>
                      ))}
                    </TreeBranchGroup>
                  </OrganizationNode>
                </TreeChild>

                <TreeChild className="organization-tree-division-item">
                  <OrganizationNode className="organization-division" title={t.regionalBranches} description={t.regionalDescription}>
                    <TreeBranchGroup className="organization-tree-rail organization-tree-branches">
                      {t.branches.map(([name, head, office]) => (
                        <TreeChild key={name}>
                          <section className="organization-branch">
                            <h4>{name}</h4>
                            <dl>
                              <div>
                                <dt>{t.branchHead}</dt>
                                <dd>{head}</dd>
                              </div>
                              <div>
                                <dt>{t.branchOffice}</dt>
                                <dd>{office}</dd>
                              </div>
                            </dl>
                          </section>
                        </TreeChild>
                      ))}
                    </TreeBranchGroup>
                  </OrganizationNode>
                </TreeChild>
              </TreeBranchGroup>
            </TreeChild>
          </TreeBranchGroup>
        </div>
      </section>

      <section className="card content organization-contacts" aria-labelledby="organizationContactsTitle">
        <h2 id="organizationContactsTitle">{t.contactsTitle}</h2>
        <p>{t.contactsDescription}</p>
        <div className="organization-contact-list">
          {t.contacts.map(([label, value, href]) => (
            <div className="organization-contact-item" key={`${label}-${value}`}>
              <span>{label}</span>
              <a href={href}>{value}</a>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
