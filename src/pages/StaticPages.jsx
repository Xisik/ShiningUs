import { useEffect, useMemo, useState } from 'react';
import { toHash } from '../router/useHashRoute.js';
import { useLanguage } from '../state/LanguageContext.jsx';

const text = {
  ko: {
    homeIntro: '성소수자 공조단체 빛청모에 오신 것을 환영합니다! 빛청모는 오픈채팅방, SNS, 회원 모집 등으로 다양한 활동을 겸하고 있습니다. 성소수자 공조단체 빛청모는 여러분의 참여와 후원을 기다립니다. 단체 소개, 회원 안내, 문의하기 등 다양한 정보를 확인해보세요.',
    featuredSlides: '주요 이미지 슬라이드',
    mainActions: '메인 버튼',
    joinOpenChat: '오픈채팅 참여하기',
    kakaoRoom: '카카오톡 채팅방입니다.',
    useLinkToJoin: '링크를 누르면 연결됩니다.',
    join: '참여하기',
    followSns: 'SNS 팔로우',
    snsLinks: 'SNS 링크입니다.',
    pleaseFollow: '팔로우 부탁드립니다.',
    follow: '팔로우',
    membership: '회원 가입',
    membershipTypes: '정회원 및 준회원',
    membershipForm: '통합 회원가입 양식입니다.',
    signUp: '가입하기',
    memberQuestion: '정회원과 준회원의 차이가 무엇인가요?',
    memberQuestionOpen: '정회원과 준회원의 차이 보기',
    memberQuestionClose: '정회원과 준회원의 차이 닫기',
    fullMemberInfo: '정회원은 우리 모임의 전반적인 활동에 적극 참여하고 활동하는 회원으로써 각종 행사 참여와 총회에서 임원으로써의 선거권/피선거권을 가지며 각종 월례/ 연례 자료를 제공받을 수 있습니다. 정기 회비 납부가 필수입니다.',
    associateMemberInfo: '준회원은 연령이나 개인적 상황등의 이유로 제한적으로 활동에 참여하는 회원으로써 각종 행사에 참여하거나 각종 월례/연례 자료를 제공받습니다. 정기 회비 납부는 필수가 아닙니다.',
    aboutTitle: '단체소개',
    aboutIntro: '빛나는 우리 청소년 성소수자 모임은 성적 지향과 성별 정체성으로 인해 혼자 고민하거나 위축되기 쉬운 청소년들이 안전하고 편안하게 자신을 표현할 수 있기 위해 결성된 단체입니다. 우리는 서로의 이야기를 존중하며 나누고, 차별과 혐오가 아닌 이해와 연대를 바탕으로 함께 성장하고자 합니다. 우리는 각자의 다름이 소중하다는 것을 배우며, 있는 그대로의 나를 긍정하고 지지받을 수 있는 경험을 만들어갑니다. 빛나는 우리는 혼자가 아니며, 함께일 때 더 단단해집니다.',
    whatWeDo: '빛청모가 하는 일',
    workItems: ['성소수자 관련 정보 공유 및 상호 지원', '권익 보호를 위한 연대 및 공조 활동', '상담/연결(의료, 법률, 심리 등) 리소스 안내', '커뮤니티 모임 및 SNS 운영'],
    membershipGuide: '회원 안내',
    membershipPurpose: '회원 모집의 목적',
    membershipPurposes: ['성소수자 의제, 청소년 의제에 대해 더욱 깊이있게 알아보고 이해할 수 있습니다.', '다양한 사람들과 함께 활동하며 청소년이나 성소수자 이외의 소수자 집단에 대해 자세히 알 수 있습니다.', '청소년 성소수자 이외의 다른 의제(청소년 노동권, 여성인권, 비인간 동물, 기후정의 등등)들을 잘 알 수 있습니다.'],
    fullMember: '정회원',
    associateMember: '준회원',
    safetyRespect: '안전과 존중',
    safetyItems: ['개인정보는 목적 외에 사용을 하지 않습니다.', '커뮤니티 가이드라인 기반의 운영을 하고 있습니다.', '혐오/차별/괴롭힘에 대해 반대합니다.'],
    bylawsTitle: '빛청모 정관 보러가기',
    bylawsDescription: '빛청모는 지정기부금 단체로의 지정을 추진하고있으며 관련 법률 및 정관에 따라 정관 본문을 공개합니다.',
    bylawsLink: '정관 보러가기',
    contactTitle: '문의하기',
    contactDescription: '긴급한 사항은 아래 연락처로 문의주세요!',
    contacts: '연락처',
    contactRows: [
      ['대표메일', 'jenaeon3@gmail.com'],
      ['사무국 웨이브팀 / 홍보소통팀', 'shinelgbtqkr@naver.com'],
      ['사무국 기획조직팀 / 운영지원팀', 'shinelgbtqkr@proton.me'],
      ['정치위원회', 'shinelgbtqpoli@proton.me'],
      ['전남광주통합특별시지부', 'ysgrainbow@gmail.com'],
      ['일반문의', '070-7953-8302'],
      ['대표 박서영', '010-4930-5488'],
      ['부대표 금강', '010-3008-6245']
    ],
    donateTitle: '빛청모 후원하기',
    donateDescription: '빛청모를 후원해주세요. 여러분의 후원이 성소수자 커뮤니티를 더욱 강하게 만듭니다.',
    waysToDonate: '후원 방법',
    donationUseIntro: '빛청모는 여러분의 후원을 기다리고 있습니다. 후원금은 다음과 같은 활동에 사용됩니다:',
    donationUses: ['커뮤니티 모임 및 행사 운영', '홍보용 굿즈 제작', '퀴어 관련 행사 부스 운영'],
    recurringDonation: '정기 후원',
    oneTimeDonation: '일시 후원',
    developerDonateTitle: '개발자 후원하기(별도)',
    developerDonateDescription: '본 후원은 대한민국 민법 제554조에 따른 증여계약의 성격을 가지며, 후원자의 의사에 따라 개발자 개인에게 무상으로 제공되는 재산입니다. 후원금은 빛나는우리청소년성소수자모임에 대한 기부금이나 회비가 아니며, 단체의 재산 또는 회계에 편입되지 않습니다. 후원금은 홈페이지 개발, 유지보수, 서버 운영, 보안 관리 및 기타 기술적 활동을 수행하는 개발자 개인에게 직접 귀속되며, 대한민국 민법에 따라 개발자 개인의 재산으로 관리됩니다. 본 후원은 단체에 대한 후원과 법적으로 구분되며, 단체에 대한 기부 또는 후원을 희망하는 경우에는 별도의 빛나는우리청소년성소수자모임 후원 경로를 이용하여 주시기 바랍니다.',
    developerUseIntro: '개발자 후원금은 다음과 같은 활동에 사용됩니다:',
    developerUses: ['사이트 수정 및 유지 보수비', '빛청모 산하 타 사이트 운영', '그 외의 개인 개발을 위한 자금'],
    developerDonation: '개발자 후원',
    poliTitle: '빛청모 정치위원회',
    poliDescription: '청소년의 정치적 권리를 선언하다',
    poliCardTitle: '우리는 침묵하지 않는다',
    poliCardDescription: '청소년·성소수자·노동권 의제를 중심으로 정치적 실천을 이어갑니다.'
  },
  en: {
    homeIntro: 'Welcome to Shining Us, an LGBTQ mutual-aid organization. We run open chat rooms, social media channels, membership programs, and other community activities. Shining Us welcomes your participation and support. Learn about the organization, membership, contact channels, and more.',
    featuredSlides: 'Featured image slideshow',
    mainActions: 'Main actions',
    joinOpenChat: 'Join Open Chat',
    kakaoRoom: 'This is our KakaoTalk chat room.',
    useLinkToJoin: 'Use the link to join.',
    join: 'Join',
    followSns: 'Follow on SNS',
    snsLinks: 'These are our SNS links.',
    pleaseFollow: 'Please follow us.',
    follow: 'Follow',
    membership: 'Membership',
    membershipTypes: 'Full and associate membership',
    membershipForm: 'Integrated membership form',
    signUp: 'Sign up',
    memberQuestion: 'What is the difference between full and associate members?',
    memberQuestionOpen: 'View the difference between full and associate members',
    memberQuestionClose: 'Close the membership difference',
    fullMemberInfo: 'Full members actively participate in the organization, may take part in events, have voting and candidacy rights for officer roles at the general assembly, and can receive monthly and annual materials. Regular membership dues are required.',
    associateMemberInfo: 'Associate members participate in a limited way due to age or personal circumstances. They may join events and receive monthly and annual materials. Regular membership dues are not required.',
    aboutTitle: 'About Us',
    aboutIntro: 'Shining Us is a group for LGBTQ youth who may feel isolated or discouraged because of sexual orientation or gender identity. We create a safe and comfortable space where young people can express themselves. We share our stories with respect and grow together through understanding and solidarity rather than discrimination or hate. We learn that our differences matter and build experiences where each person can affirm and be supported as they are. We are not alone, and we become stronger together.',
    whatWeDo: 'What Shining Us Does',
    workItems: ['Shares LGBTQ-related information and mutual support', 'Builds solidarity and joint action to protect rights', 'Guides people to medical, legal, psychological, and other support resources', 'Runs community gatherings and social media channels'],
    membershipGuide: 'Membership Guide',
    membershipPurpose: 'Purpose of Membership Recruitment',
    membershipPurposes: ['Members can learn more deeply about LGBTQ and youth issues.', 'Members can work with diverse people and learn about minority groups beyond youth and LGBTQ communities.', 'Members can also learn about other issues such as youth labor rights, women’s rights, non-human animals, and climate justice.'],
    fullMember: 'Full member',
    associateMember: 'Associate member',
    safetyRespect: 'Safety and Respect',
    safetyItems: ['Personal information is not used beyond its stated purpose.', 'The community is operated based on community guidelines.', 'We oppose hate, discrimination, and harassment.'],
    bylawsTitle: 'View Shining Us Bylaws',
    bylawsDescription: 'Shining Us is pursuing designation as an eligible donation organization and publishes its bylaws according to relevant law and internal rules.',
    bylawsLink: 'View bylaws',
    contactTitle: 'Contact',
    contactDescription: 'For urgent matters, please use the contacts below.',
    contacts: 'Contacts',
    contactRows: [
      ['Main email', 'jenaeon3@gmail.com'],
      ['Secretariat Wave Team / PR & Communications Team', 'shinelgbtqkr@naver.com'],
      ['Secretariat Planning & Organizing Team / Operations Support Team', 'shinelgbtqkr@proton.me'],
      ['Political Committee', 'shinelgbtqpoli@proton.me'],
      ['Jeonnam-Gwangju Integrated Branch', 'ysgrainbow@gmail.com'],
      ['General inquiries', '070-7953-8302'],
      ['Representative Park Seo-young', '010-4930-5488'],
      ['Vice Representative Geumgang', '010-3008-6245']
    ],
    donateTitle: 'Donate to Shining Us',
    donateDescription: 'Support Shining Us. Your contribution strengthens the LGBTQ community.',
    waysToDonate: 'Ways to Donate',
    donationUseIntro: 'Shining Us welcomes your support. Donations are used for the following activities:',
    donationUses: ['Operating community gatherings and events', 'Creating promotional goods', 'Running booths at queer-related events'],
    recurringDonation: 'Recurring Donation',
    oneTimeDonation: 'One-Time Donation',
    developerDonateTitle: 'Support the Developer (Separate)',
    developerDonateDescription: 'This support is a gift agreement under Article 554 of the Civil Act of the Republic of Korea. It is property provided free of charge to the individual developer according to the donor’s intent. These funds are not donations or membership dues for Shining Us, LGBTQ Youth, and are not included in the organization’s property or accounting. They belong directly to the individual developer who performs website development, maintenance, server operation, security management, and other technical work, and are managed as the developer’s personal property under Korean civil law. This support is legally separate from donations to the organization. If you wish to donate to the organization, please use the separate Shining Us donation channel.',
    developerUseIntro: 'Developer support is used for the following activities:',
    developerUses: ['Website updates and maintenance costs', 'Operation of other Shining Us-related sites', 'Other personal development costs'],
    developerDonation: 'Support the Developer',
    poliTitle: 'Shining Us Political Committee',
    poliDescription: 'Declaring the political rights of youth',
    poliCardTitle: 'We Will Not Be Silent',
    poliCardDescription: 'We continue political action centered on youth, LGBTQ, and labor rights.'
  }
};

const slides = [
  ['thumbnail_00', 'eager'],
  ['thumbnail_01', 'lazy'],
  ['thumbnail_02', 'lazy']
];

function usePageText() {
  const { language } = useLanguage();
  return text[language] || text.ko;
}

function List({ items }) {
  return (
    <ul>
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  );
}

export function HomePage() {
  const t = usePageText();
  const [memberInfoOpen, setMemberInfoOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const transform = useMemo(() => `translateX(-${slideIndex * 100}%)`, [slideIndex]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSlideIndex((current) => (current + 1) % slides.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="container index_main_grid">
      <main className="main-content">
        <h1 className="hero-title">{t === text.en ? 'Shining Us' : '빛청모'}</h1>

        <section className="hero">
          <p>{t.homeIntro}</p>
        </section>

        <section className="slides" aria-label={t.featuredSlides}>
          <ul className="slide-track" data-slide-track style={{ transform }}>
            {slides.map(([name, loading], index) => (
              <li className="slide" key={name}>
                <a href={toHash('/')}>
                  <picture>
                    <source
                      type="image/webp"
                      srcSet={`./assets/img/generated/${name}-360.webp 360w, ./assets/img/generated/${name}-720.webp 720w`}
                      sizes="(max-width: 960px) 100vw, 52rem"
                    />
                    <img
                      src={`./assets/img/${name}.png`}
                      alt={t === text.en ? `Image ${index + 1}` : `이미지${index + 1}`}
                      loading={loading}
                      decoding="async"
                      fetchPriority={index === 0 ? 'high' : undefined}
                    />
                  </picture>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="grid" aria-label={t.mainActions}>
          <article className="card">
            <h2>{t.joinOpenChat}</h2>
            <div className="join-item">
              <p>{t.kakaoRoom}</p>
              <p>{t.useLinkToJoin}</p>
              <a className="btn btn-primary" href="https://open.kakao.com/o/gRByFFTg" target="_blank" rel="noopener noreferrer">{t.join}</a>
            </div>
          </article>

          <article className="card">
            <h2>{t.followSns}</h2>
            <div className="join-item">
              <p>{t.snsLinks}</p>
              <p>{t.pleaseFollow}</p>
              <a className="btn btn-primary" href="https://linktr.ee/shinelgbtqkr" target="_blank" rel="noopener noreferrer">{t.follow}</a>
            </div>
          </article>

          <article className="card">
            <h2>{t.membership}</h2>
            <div className="join-item">
              <p>{t.membershipTypes}</p>
              <p>{t.membershipForm}</p>
              <a className="btn btn-primary" href="https://docs.google.com/forms/d/e/1FAIpQLSdIptTfcIdpSzIKZTxlenlAdDixBxK6E1fzwn9n4DcMP-CjRg/viewform" target="_blank" rel="noopener noreferrer">{t.signUp}</a>
            </div>
          </article>

          <div className="join-footer">
            <button
              type="button"
              className="member-toggle"
              aria-expanded={memberInfoOpen}
              aria-controls="memberDiffBox"
              onClick={() => setMemberInfoOpen((open) => !open)}
            >
              <span className="member-toggle-label">
                {memberInfoOpen ? t.memberQuestionClose : t.memberQuestionOpen}
              </span>
              <span className="member-toggle-icon" aria-hidden="true">{memberInfoOpen ? '\uf068' : '\uf067'}</span>
            </button>

            <div className={`info-box${memberInfoOpen ? ' is-open' : ''}`} id="memberDiffBox" aria-hidden={!memberInfoOpen}>
              <p>{t.fullMemberInfo}</p>
              <p>{t.associateMemberInfo}</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export function AboutPage() {
  const t = usePageText();

  return (
    <main className="container">
      <section className="page-header">
        <h1>{t.aboutTitle}</h1>
        <p>{t.aboutIntro}</p>
      </section>

      <section className="card content">
        <h2>{t.whatWeDo}</h2>
        <List items={t.workItems} />
      </section>

      <section className="card content" id="membership">
        <h2>{t.membershipGuide}</h2>
        <div>
          <h3>{t.membershipPurpose}</h3>
          <List items={t.membershipPurposes} />
          <br />
        </div>
        <div className="diff">
          <div className="diff-col">
            <h3>{t.fullMember}</h3>
            <p>{t.fullMemberInfo}</p>
          </div>
          <div className="diff-col">
            <h3>{t.associateMember}</h3>
            <p>{t.associateMemberInfo}</p>
          </div>
        </div>
      </section>

      <section className="card content">
        <h2>{t.safetyRespect}</h2>
        <List items={t.safetyItems} />
      </section>

      <article className="card">
        <h2>{t.bylawsTitle}</h2>
        <div className="join-item">
          <p>{t.bylawsDescription}</p>
          <a className="btn btn-primary" href="https://www.notion.so/30723dec97d58037be47f196f5d70882?source=copy_link" target="_blank" rel="noopener noreferrer">{t.bylawsLink}</a>
        </div>
      </article>
    </main>
  );
}

export function ContactPage() {
  const t = usePageText();

  return (
    <main className="container">
      <section className="page-header">
        <h1>{t.contactTitle}</h1>
        <p>{t.contactDescription}</p>
      </section>

      <section className="card content">
        <h2>{t.contacts}</h2>
        <div className="contact-list">
          {t.contactRows.map(([label, value]) => (
            <div className="contact-item" key={`${label}-${value}`}>
              <div className="contact-name">{label}</div>
              <div className="contact-phone">{value}</div>
            </div>
          ))}
        </div>
        <hr />
      </section>
    </main>
  );
}

export function DonatePage() {
  const t = usePageText();

  return (
    <main className="donate-container-grid container">
      <section className="page-header">
        <h1>{t.donateTitle}</h1>
        <p>{t.donateDescription}</p>
      </section>

      <section className="card content">
        <h2>{t.waysToDonate}</h2>
        <p>{t.donationUseIntro}</p>
        <List items={t.donationUses} />
        <hr />
        <div className="join-column-item">
          <a href="https://link.donationbox.co.kr/donationBoxList.jsp?campaignuid=RKs7J0yqsW" className="btn btn-primary" target="_blank" rel="noopener noreferrer">{t.recurringDonation}</a>
          <a href="https://aq.gy/f/FOYjM" className="btn btn-primary" target="_blank" rel="noopener noreferrer">{t.oneTimeDonation}</a>
        </div>
      </section>

      <section className="page-header">
        <h1>{t.developerDonateTitle}</h1>
        <p>{t.developerDonateDescription}</p>
      </section>

      <section className="card content">
        <h2>{t.waysToDonate}</h2>
        <p>{t.developerUseIntro}</p>
        <List items={t.developerUses} />
        <hr />
        <div className="join-column-item">
          <a href="https://ko-fi.com/B8C82214VE" className="btn btn-primary" target="_blank" rel="noopener noreferrer">{t.developerDonation}</a>
        </div>
      </section>
    </main>
  );
}

export function PoliPage() {
  const t = usePageText();

  return (
    <main className="container">
      <section className="page-header">
        <h1>{t.poliTitle}</h1>
        <p>{t.poliDescription}</p>
      </section>

      <section className="card content">
        <h2>{t.poliCardTitle}</h2>
        <p>{t.poliCardDescription}</p>
        <p className="join-column-item">
          <a className="btn btn-primary" href={toHash('/contact')}>{t.contactTitle}</a>
        </p>
      </section>
    </main>
  );
}
