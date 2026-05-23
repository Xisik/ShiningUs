(function () {
  'use strict';

  const ui = window.__ui || (window.__ui = {});
  const KEY = 'language';
  const root = document.documentElement;
  const textOrigins = new WeakMap();
  const attrOrigins = new WeakMap();

  const koToEn = {
    '빛청모': 'Bichcheongmo',
    '빛청모 | 메인': 'Bichcheongmo | Home',
    '빛청모 | 단체 소개': 'Bichcheongmo | About',
    '빛청모 | 활동공유': 'Bichcheongmo | Activities',
    '빛청모 | 성명공유': 'Bichcheongmo | Statements',
    '빛청모 | 문의하기': 'Bichcheongmo | Contact',
    '빛청모 | 후원하기': 'Bichcheongmo | Donate',
    '빛청모 | 지역지부': 'Bichcheongmo | Regional Branches',
    '빛청모 | 정치위원회': 'Bichcheongmo | Political Committee',
    '빛청모 | 정치위원회 성명': 'Bichcheongmo | Political Committee Statements',
    '빛청모 — 성소수자 공조 단체': 'Bichcheongmo — LGBTQ mutual-aid organization',
    '빛청모의 설립 목적, 구성원, 활동 방향을 소개합니다.': 'Learn about Bichcheongmo, its purpose, members, and direction.',
    '빛청모에 문의하거나 가입 신청을 할 수 있습니다.': 'Contact Bichcheongmo or ask about joining.',
    '빛청모를 후원해주세요. 여러분의 후원이 성소수자 커뮤니티를 더욱 강하게 만듭니다.': 'Support Bichcheongmo. Your contribution strengthens the LGBTQ community.',
    '빛청모의 다양한 활동과 소식을 공유하는 공간입니다.': 'A space for sharing Bichcheongmo activities and updates.',
    '빛청모의 다양한 성명과 소식을 공유하는 공간입니다.': 'A space for sharing Bichcheongmo statements and updates.',
    '빛청모 정치위원회의 성명서를 공유하는 공간입니다.': 'A space for sharing statements from the Bichcheongmo Political Committee.',
    '빛청모 정치위원회 활동과 성명을 확인하세요.': 'See the work and statements of the Bichcheongmo Political Committee.',
    '빛청모의 활동을 확인하세요.': 'View Bichcheongmo activities.',
    '빛청모의 성명을 확인하세요.': 'View Bichcheongmo statements.',
    '빛청모의 지역지부 소개 페이지입니다. 전국 각 지역의 지부 정보를 확인하실 수 있습니다.': 'An introduction to Bichcheongmo regional branches across Korea.',
    'ko_KR': 'en_US',

    '홈으로': 'Go home',
    '주요 메뉴': 'Primary menu',
    '언어 선택': 'Language selection',
    '메뉴 열기': 'Open menu',
    '홈': 'Home',
    '단체 소개': 'About',
    '활동공유': 'Activities',
    '문의하기': 'Contact',
    '후원하기': 'Donate',
    '지역지부': 'Regional Branches',
    '정치위원회': 'Political Committee',
    '성명': 'Statements',
    '다크 모드': 'Dark mode',
    '다크 모드로 전환': 'Switch to dark mode',
    '라이트 모드로 전환': 'Switch to light mode',

    '성소수자 공조단체 빛청모에 오신 것을 환영합니다! 빛청모는 오픈채팅방, SNS, 회원 모집 등으로 다양한 활동을 겸하고 있습니다. 성소수자 공조단체 빛청모는 여러분의 참여와 후원을 기다립니다. 단체 소개, 회원 안내, 문의하기 등 다양한 정보를 확인해보세요.': 'Welcome to Bichcheongmo, an LGBTQ mutual-aid organization. We run open chat rooms, social media channels, membership programs, and other community activities. Bichcheongmo welcomes your participation and support. Learn about the organization, membership, contact channels, and more.',
    '메인 버튼': 'Main actions',
    '오픈채팅 참여하기': 'Join Open Chat',
    '카카오톡 채팅방입니다.': 'This is our KakaoTalk chat room.',
    '링크를 누르면 연결됩니다.': 'Use the link to join.',
    '참여하기': 'Join',
    'SNS 팔로우': 'Follow on SNS',
    'SNS 링크입니다.': 'These are our SNS links.',
    '팔로우 부탁드립니다.': 'Please follow us.',
    '팔로우': 'Follow',
    '회원 가입': 'Membership',
    '정회원 및 준회원': 'full and associate membership',
    '통합 회원가입 양식입니다.' :'integrated sign-up form',
    '가입하기': 'Sign up',
    '정회원과 준회원의 차이가 무엇인가요?': 'What is the difference between full and associate members?',
    '정회원은 우리 모임의 전반적인 활동에 적극 참여하고 활동하는 회원으로써 각종 행사 참여와 총회에서 임원으로써의 선거권/피선거권을 가지며 각종 월례/ 연례 자료를 제공받을 수 있습니다. 정기 회비 납부가 필수입니다.': 'Full members actively participate in the organization, may take part in events, have voting and candidacy rights for officer roles at the general assembly, and can receive monthly and annual materials. Regular membership dues are required.',
    '준회원은 연령이나 개인적 상황등의 이유로 제한적으로 활동에 참여하는 회원으로써 각종 행사에 참여하거나 각종 월례/연례 자료를 제공받습니다. 정기 회비 납부는 필수가 아닙니다.': 'Associate members participate in a limited way due to age or personal circumstances. They may join events and receive monthly and annual materials. Regular membership dues are not required.',
    '빠른 이동': 'Quick links',
    '단체 소개로 이동': 'Go to About',
    '문의하기로 이동': 'Go to Contact',
    '정회원과 준회원의 차이': 'Difference between full and associate members',
    '닫기': 'Close',
    '아래 내용은 예시 문구이다. 단체 운영 기준에 맞게 수정하면 된다.': 'The content below is sample copy and can be adjusted to the organization rules.',
    '정회원(예시)': 'Full member (example)',
    '정기 회비 납부 또는 활동 기준 충족': 'Pays regular dues or meets activity requirements',
    '총회/의결권 등 운영 참여 가능': 'Can participate in governance, including general meetings and voting',
    '내부 자료/프로그램 우선 참여': 'Receives priority access to internal materials and programs',
    '준회원(예시)': 'Associate member (example)',
    '가입 절차 간소화(기본 정보 등록)': 'Simplified signup with basic information',
    '커뮤니티/공지 수신 및 일부 프로그램 참여': 'Can receive community notices and join some programs',
    '의결권은 없거나 제한될 수 있음': 'Voting rights may be unavailable or limited',
    '실제 기준(회비, 권한, 참여 범위)은 단체 규정에 따라 정리해 넣으면 된다.': 'Actual criteria such as dues, rights, and participation scope should follow the organization rules.',
    '자세히 보기': 'Learn more',

    '단체소개': 'About Us',
    '빛나는 우리 청소년 성소수자 모임은 성적 지향과 성별 정체성으로 인해 혼자 고민하거나 위축되기 쉬운 청소년들이 안전하고 편안하게 자신을 표현할 수 있기 위해 결성된 단체입니다. 우리는 서로의 이야기를 존중하며 나누고, 차별과 혐오가 아닌 이해와 연대를 바탕으로 함께 성장하고자 합니다. 우리는 각자의 다름이 소중하다는 것을 배우며, 있는 그대로의 나를 긍정하고 지지받을 수 있는 경험을 만들어갑니다. 빛나는 우리는 혼자가 아니며, 함께일 때 더 단단해집니다.': 'Bichcheongmo is a group for LGBTQ youth who may feel isolated or discouraged because of sexual orientation or gender identity. We create a safe and comfortable space where young people can express themselves. We share our stories with respect and grow together through understanding and solidarity rather than discrimination or hate. We learn that our differences matter and build experiences where each person can affirm and be supported as they are. We are not alone, and we become stronger together.',
    '빛청모가 하는 일': 'What Bichcheongmo Does',
    '성소수자 관련 정보 공유 및 상호 지원': 'Shares LGBTQ-related information and mutual support',
    '권익 보호를 위한 연대 및 공조 활동': 'Builds solidarity and joint action to protect rights',
    '상담/연결(의료, 법률, 심리 등) 리소스 안내': 'Guides people to medical, legal, psychological, and other support resources',
    '커뮤니티 모임 및 SNS 운영': 'Runs community gatherings and social media channels',
    '회원 안내': 'Membership Guide',
    '정회원': 'Full member',
    '정회원은 우리 모임의 전반적인 활동에 적극 참여하고 활동하는 활동가로써 각종 행사 참여와 총회에서 임원으로써의 선거권/피선거권을 가지며 각종 월례/ 연례 자료를 제공받을 수 있습니다. 정기 회비 납부가 필수입니다.': 'Full members are active participants in the organization. They may take part in events, have voting and candidacy rights for officer roles at the general assembly, and receive monthly and annual materials. Regular membership dues are required.',
    '준회원': 'Associate member',
    '안전과 존중': 'Safety and Respect',
    '개인정보는 목적 외에 사용을 하지 않습니다.': 'Personal information is not used beyond its stated purpose.',
    '커뮤니티 가이드라인 기반의 운영을 하고 있습니다.': 'The community is operated based on community guidelines.',
    '혐오/차별/괴롭힘에 대해 반대합니다.': 'We oppose hate, discrimination, and harassment.',
    '빛청모 정관 보러가기': 'View Bichcheongmo Bylaws',
    '빛청모는 지정기부금 단체로의 지정을 추진하고있으며 관련 법률 및 정관에 따라 정관 본문을 공개합니다.': 'Bichcheongmo is pursuing designation as an eligible donation organization and publishes its bylaws according to relevant law and internal rules.',
    '정관 보러가기': 'View bylaws',

    '긴급한 사항은 아래 연락처로 문의주세요!': 'For urgent matters, please use the contacts below.',
    '연락처': 'Contacts',
    '대표메일': 'Main email',
    '사무국 웨이브팀 / 홍보소통팀': 'Secretariat Wave Team / PR & Communications Team',
    '사무국 기획조직팀 / 운영지원팀': 'Secretariat Planning & Organizing Team / Operations Support Team',
    '전남광주통합특별시지부': 'Jeonnam-Gwangju Integrated Branch',
    '일반문의': 'General inquiries',
    '대표 박서영': 'Representative Park Seo-young',
    '부대표 금강': 'Vice Representative Geumgang',

    '후원 방법': 'Ways to Donate',
    '빛청모는 여러분의 후원을 기다리고 있습니다. 후원금은 다음과 같은 활동에 사용됩니다:': 'Bichcheongmo welcomes your support. Donations are used for the following activities:',
    '커뮤니티 모임 및 행사 운영': 'Operating community gatherings and events',
    '홍보용 굿즈 제작': 'Creating promotional goods',
    '퀴어 관련 행사 부스 운영': 'Running booths at queer-related events',
    '정기후원': 'Recurring donation',
    '일시후원': 'One-time donation',

    '빛청모 정치위원회': 'Bichcheongmo Political Committee',
    '청소년의 정치적 권리를 선언하다': 'Declaring the political rights of youth',
    '우리는 침묵하지 않는다': 'We Will Not Be Silent',
    '청소년·성소수자·노동권 의제를 중심으로 정치적 실천을 이어갑니다.': 'We continue political action centered on youth, LGBTQ, and labor rights.',

    '지역지부 소개': 'Regional Branches',
    '빛청모는 전국 단위의 단체로 지역 회원들 간 소통을 위해 지역지부를 운영하고 있습니다!': 'Bichcheongmo operates regional branches to support communication among members across Korea.',
    '지역지부 목록': 'Regional Branch List',
    '빛청모 부산울산경남지부': 'Bichcheongmo Busan-Ulsan-Gyeongnam Branch',
    '빛청모 전남광주통합특별시지부': 'Bichcheongmo Jeonnam-Gwangju Integrated Branch',
    '빛청모 서울경기지부': 'Bichcheongmo Seoul-Gyeonggi Branch',
    '빛청모 충청지부': 'Bichcheongmo Chungcheong Branch',
    '트위터': 'X/Twitter',
    '인스타그램': 'Instagram',
    '대표 금강': 'Representative Geumgang',
    '대표 서영': 'Representative Seo-young',
    '대표 혜은': 'Representative Hye-eun',
    '대표 재현': 'Representative Jae-hyun',
    '이메일': 'Email',

    '활동 목록': 'Activities list',
    '활동 목록이 비어있음': 'Activities list is empty',
    '아직 등록된 활동이 없습니다.': 'There are no activities yet.',
    '곧 새로운 활동을 공유할 예정입니다.': 'New activities will be shared soon.',
    '활동 목록 로딩 중': 'Loading activities list',
    '활동 목록을 불러오는 중...': 'Loading activities...',
    '오류 발생': 'An error occurred',
    '활동 목록을 불러오는 중 오류가 발생했습니다.': 'An error occurred while loading the activity list.',
    '잠시 후 다시 시도해주세요.': 'Please try again later.',
    '활동 메타 정보': 'Activity metadata',
    '활동 요약': 'Activity summary',
    '활동 본문': 'Activity body',
    '활동 상세 페이지 푸터': 'Activity detail footer',
    '활동을 찾을 수 없습니다': 'Activity not found',
    '활동을 찾을 수 없음': 'Activity not found',
    '활동을 찾을 수 없습니다.': 'Activity not found.',
    '요청하신 활동이 존재하지 않거나 삭제되었을 수 있습니다.': 'The requested activity may not exist or may have been deleted.',
    '요청하신 활동을 찾을 수 없습니다.': 'The requested activity could not be found.',
    '이 활동은 공개되지 않았습니다.': 'This activity is not public.',
    '활동 상세 내용을 불러오는 중 오류가 발생했습니다.': 'An error occurred while loading the activity detail.',
    '목록으로 돌아가기': 'Back to list',
    '활동 목록으로 돌아가기': 'Back to activity list',
    '내용이 없습니다.': 'No content available.',

    '성명 목록': 'Statements list',
    '성명 목록이 비어있음': 'Statements list is empty',
    '아직 등록된 성명이 없습니다.': 'There are no statements yet.',
    '곧 새로운 성명을 공유할 예정입니다.': 'New statements will be shared soon.',
    '성명 목록 로딩 중': 'Loading statements list',
    '성명 목록을 불러오는 중...': 'Loading statements...',
    '성명 목록을 불러오는 중 오류가 발생했습니다.': 'An error occurred while loading the statement list.',
    '성명 메타 정보': 'Statement metadata',
    '성명 요약': 'Statement summary',
    '성명 본문': 'Statement body',
    '성명 상세 페이지 푸터': 'Statement detail footer',
    '성명을 찾을 수 없습니다': 'Statement not found',
    '성명을 찾을 수 없음': 'Statement not found',
    '성명을 찾을 수 없습니다.': 'Statement not found.',
    '요청하신 성명이 존재하지 않거나 삭제되었을 수 있습니다.': 'The requested statement may not exist or may have been deleted.',
    '요청하신 성명을 찾을 수 없습니다.': 'The requested statement could not be found.',
    '이 성명은 공개되지 않았습니다.': 'This statement is not public.',
    '성명 상세 내용을 불러오는 중 오류가 발생했습니다.': 'An error occurred while loading the statement detail.',
    '성명 목록으로 돌아가기': 'Back to statement list',
    '일부 데이터를 불러오지 못했습니다.': 'Some data could not be loaded.',
    '최신 데이터를 불러오지 못했습니다. 캐시된 데이터를 표시합니다.': 'Latest data could not be loaded. Cached data is being shown.',
    '본문으로 건너뛰기': 'Skip to main content',

    '사업자번호 231-82-77851': 'Business registration no. 231-82-77851',
    '본 단체는 관할 세무서에 등록된 임의단체로써 고유사업 외의 수익 사업을 영위하지 않습니다': 'This organization is a registered unincorporated association and does not conduct profit-making activities outside its stated purposes.',
    '© 빛청모': '© Bichcheongmo'
  };

  const enToKo = Object.fromEntries(Object.entries(koToEn).map(([ko, en]) => [normalize(en), ko]));

  function normalize(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function getStoredLanguage() {
    const value = localStorage.getItem(KEY);
    return value === 'en' || value === 'ko' ? value : null;
  }

  function getLanguage() {
    return root.getAttribute('lang') === 'en' ? 'en' : 'ko';
  }

  function formatEnglishDateFromKorean(value) {
    const match = normalize(value).match(/^(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일$/);
    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(year, month - 1, day);
    if (Number.isNaN(date.getTime())) return null;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function formatKoreanDateFromEnglish(value) {
    const normalized = normalize(value);
    if (!/^[A-Za-z]+\s+\d{1,2},\s+\d{4}$/.test(normalized)) return null;

    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) return null;

    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  }

  function translatePattern(source, language) {
    const normalized = normalize(source);
    if (language === 'ko') {
      const date = formatKoreanDateFromEnglish(normalized);
      if (date) return date;

      let match = normalized.match(/^Last updated:\s*(.+)$/);
      if (match) {
        return `마지막 업데이트: ${formatKoreanDateFromEnglish(match[1]) || match[1]}`;
      }

      match = normalized.match(/^Activities list,\s*(\d+)\s*total$/);
      if (match) return `활동 목록, 총 ${match[1]}개`;

      match = normalized.match(/^Statements list,\s*(\d+)\s*total$/);
      if (match) return `성명 목록, 총 ${match[1]}개`;

      match = normalized.match(/^Activity date:\s*(.+)$/);
      if (match) return `활동 날짜: ${formatKoreanDateFromEnglish(match[1]) || match[1]}`;

      match = normalized.match(/^Statement date:\s*(.+)$/);
      if (match) return `성명 날짜: ${formatKoreanDateFromEnglish(match[1]) || match[1]}`;

      match = normalized.match(/^Category:\s*(.+)$/);
      if (match) return `카테고리: ${match[1]}`;

      match = normalized.match(/^(.+)\sactivity image$/);
      if (match) return `${match[1]} 활동 이미지`;

      match = normalized.match(/^(.+)\sstatement image$/);
      if (match) return `${match[1]} 성명 이미지`;

      match = normalized.match(/^(.+)\s-\sView details$/);
      if (match) return `${match[1]} - 상세 보기`;

      match = normalized.match(/^(.+)\s\|\sBichcheongmo\s\|\sActivities$/);
      if (match) return `${match[1]} | 빛청모 | 활동공유`;

      match = normalized.match(/^(.+)\s\|\sBichcheongmo\s\|\sStatements$/);
      if (match) return `${match[1]} | 빛청모 | 성명공유`;

      return null;
    }

    if (language !== 'en') return null;

    const date = formatEnglishDateFromKorean(normalized);
    if (date) return date;

    let match = normalized.match(/^마지막 업데이트:\s*(.+)$/);
    if (match) {
      return `Last updated: ${formatEnglishDateFromKorean(match[1]) || match[1]}`;
    }

    match = normalized.match(/^활동 목록, 총\s*(\d+)개$/);
    if (match) return `Activities list, ${match[1]} total`;

    match = normalized.match(/^성명 목록, 총\s*(\d+)개$/);
    if (match) return `Statements list, ${match[1]} total`;

    match = normalized.match(/^활동 날짜:\s*(.+)$/);
    if (match) return `Activity date: ${formatEnglishDateFromKorean(match[1]) || match[1]}`;

    match = normalized.match(/^성명 날짜:\s*(.+)$/);
    if (match) return `Statement date: ${formatEnglishDateFromKorean(match[1]) || match[1]}`;

    match = normalized.match(/^카테고리:\s*(.+)$/);
    if (match) return `Category: ${match[1]}`;

    match = normalized.match(/^(.+)\s활동 이미지$/);
    if (match) return `${match[1]} activity image`;

    match = normalized.match(/^(.+)\s성명 이미지$/);
    if (match) return `${match[1]} statement image`;

    match = normalized.match(/^(.+)\s-\s상세 보기$/);
    if (match) return `${match[1]} - View details`;

    match = normalized.match(/^(.+)\s\|\s빛청모\s\|\s활동공유$/);
    if (match) return `${match[1]} | Bichcheongmo | Activities`;

    match = normalized.match(/^(.+)\s\|\s빛청모\s\|\s성명공유$/);
    if (match) return `${match[1]} | Bichcheongmo | Statements`;

    return null;
  }

  function translateValue(source, language) {
    const normalized = normalize(source);
    if (!normalized) return source;

    if (language === 'ko') {
      return enToKo[normalized] || translatePattern(normalized, language) || source;
    }

    return koToEn[normalized] || translatePattern(normalized, language) || source;
  }

  function setTextNodeLanguage(node, language) {
    const current = node.nodeValue;
    if (!normalize(current)) return;

    if (!textOrigins.has(node)) {
      textOrigins.set(node, current);
    }

    if (language === 'ko') {
      const original = textOrigins.get(node);
      const direct = translateValue(current, 'ko');
      if (direct !== current) {
        node.nodeValue = direct;
        textOrigins.set(node, direct);
      } else if (normalize(original) !== normalize(current) && normalize(translateValue(original, 'en')) === normalize(current)) {
        if (node.nodeValue !== original) node.nodeValue = original;
      } else {
        textOrigins.set(node, current);
      }
      return;
    }

    const direct = translateValue(current, language);
    if (direct !== current && normalize(current) !== normalize(textOrigins.get(node))) {
      textOrigins.set(node, current);
    }

    const translated = translateValue(textOrigins.get(node), language);
    if (node.nodeValue !== translated) {
      node.nodeValue = translated;
    }
  }

  function setAttrLanguage(el, attr, language) {
    if (!el.hasAttribute(attr)) return;

    const current = el.getAttribute(attr);
    if (!normalize(current)) return;

    let origins = attrOrigins.get(el);
    if (!origins) {
      origins = {};
      attrOrigins.set(el, origins);
    }
    if (!Object.prototype.hasOwnProperty.call(origins, attr)) {
      origins[attr] = current;
    }

    if (language === 'ko') {
      const original = origins[attr];
      const direct = translateValue(current, 'ko');
      if (direct !== current) {
        el.setAttribute(attr, direct);
        origins[attr] = direct;
      } else if (normalize(original) !== normalize(current) && normalize(translateValue(original, 'en')) === normalize(current)) {
        if (current !== original) el.setAttribute(attr, original);
      } else {
        origins[attr] = current;
      }
      return;
    }

    const direct = translateValue(current, language);
    if (direct !== current && normalize(current) !== normalize(origins[attr])) {
      origins[attr] = current;
    }

    const translated = translateValue(origins[attr], language);

    if (current !== translated) {
      el.setAttribute(attr, translated);
    }
  }

  function applyToNode(rootNode, language) {
    const walker = document.createTreeWalker(
      rootNode,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const parent = node.parentElement;
          if (!parent || parent.closest('script, style, noscript')) {
            return NodeFilter.FILTER_REJECT;
          }
          return normalize(node.nodeValue)
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT;
        }
      }
    );

    const textNodes = [];
    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }
    textNodes.forEach((node) => setTextNodeLanguage(node, language));

    const elements = rootNode.nodeType === Node.ELEMENT_NODE
      ? [rootNode].concat(Array.from(rootNode.querySelectorAll('*')))
      : Array.from(document.querySelectorAll('*'));

    elements.forEach((el) => {
      ['aria-label', 'title', 'alt', 'placeholder', 'content'].forEach((attr) => {
        setAttrLanguage(el, attr, language);
      });
    });
  }

  function updateControls(language) {
    document.querySelectorAll('[data-lang-option]').forEach((button) => {
      const isActive = button.getAttribute('data-lang-option') === language;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  function setLanguage(language, persist) {
    const nextLanguage = language === 'en' ? 'en' : 'ko';
    root.setAttribute('lang', nextLanguage);
    root.setAttribute('data-lang', nextLanguage);

    applyToNode(document.documentElement, nextLanguage);
    updateControls(nextLanguage);

    if (persist) {
      localStorage.setItem(KEY, nextLanguage);
    }

    window.dispatchEvent(new CustomEvent('languagechange', {
      detail: { language: nextLanguage }
    }));
  }

  function initControls() {
    document.querySelectorAll('[data-lang-option]').forEach((button) => {
      button.addEventListener('click', () => {
        const nextLanguage = button.getAttribute('data-lang-option');
        setLanguage(nextLanguage, true);
      });
    });
  }

  function initObserver() {
    const observer = new MutationObserver((mutations) => {
      const language = getLanguage();
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
              applyToNode(node, language);
            }
          });
        } else if (mutation.type === 'characterData') {
          setTextNodeLanguage(mutation.target, language);
        } else if (mutation.type === 'attributes') {
          setAttrLanguage(mutation.target, mutation.attributeName, language);
        }
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['aria-label', 'title', 'alt', 'placeholder', 'content']
    });
  }

  function t(koText) {
    return translateValue(koText, getLanguage());
  }

  function init() {
    initControls();
    setLanguage(getStoredLanguage() || 'ko', false);
    initObserver();
  }

  ui.i18n = {
    getLanguage,
    setLanguage,
    t,
    apply: () => applyToNode(document.documentElement, getLanguage())
  };

  init();
})();
