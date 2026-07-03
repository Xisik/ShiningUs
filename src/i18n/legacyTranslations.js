const legacyKoToEn = new Map([
  ['빛청모', 'Bichcheongmo'],
  ['성소수자 공조단체 빛청모에 오신 것을 환영합니다! 빛청모는 오픈채팅방, SNS, 회원 모집 등으로 다양한 활동을 겸하고 있습니다.\n          성소수자 공조단체 빛청모는 여러분의 참여와 후원을 기다립니다. 단체 소개, 회원 안내, 문의하기 등 다양한 정보를 확인해보세요.', 'Welcome to Bichcheongmo, an LGBTQ mutual-aid organization. We run open chat rooms, social media channels, membership programs, and other community activities. Bichcheongmo welcomes your participation and support. Learn about the organization, membership, contact channels, and more.'],
  ['주요 이미지 슬라이드', 'Featured image slideshow'],
  ['이미지1', 'Image 1'],
  ['이미지2', 'Image 2'],
  ['이미지3', 'Image 3'],
  ['메인 버튼', 'Main actions'],
  ['오픈채팅 참여하기', 'Join Open Chat'],
  ['카카오톡 채팅방입니다.', 'This is our KakaoTalk chat room.'],
  ['링크를 누르면 연결됩니다.', 'Use the link to join.'],
  ['참여하기', 'Join'],
  ['SNS 팔로우', 'Follow on SNS'],
  ['SNS 링크입니다.', 'These are our SNS links.'],
  ['팔로우 부탁드립니다.', 'Please follow us.'],
  ['팔로우', 'Follow'],
  ['회원 가입', 'Membership'],
  ['정회원 및 준회원', 'Full and associate membership'],
  ['통합 회원가입 양식입니다.', 'Integrated membership form'],
  ['가입하기', 'Sign up'],
  ['정회원과\n            준회원의 차이가 무엇인가요?', 'What is the difference between full and associate members?'],
  ['정회원은 우리 모임의 전반적인 활동에 적극 참여하고 활동하는 회원으로써 각종 행사 참여와 총회에서 임원으로써의 선거권/피선거권을 가지며 각종 월례/ 연례 자료를 제공받을 수 있습니다. 정기 회비\n              납부가 필수입니다.', 'Full members actively participate in the organization, may take part in events, have voting and candidacy rights for officer roles at the general assembly, and can receive monthly and annual materials. Regular membership dues are required.'],
  ['준회원은 연령이나 개인적 상황등의 이유로 제한적으로 활동에 참여하는 회원으로써 각종 행사에 참여하거나 각종 월례/연례 자료를 제공받습니다. 정기 회비 납부는 필수가 아닙니다.', 'Associate members participate in a limited way due to age or personal circumstances. They may join events and receive monthly and annual materials. Regular membership dues are not required.'],
  ['정회원과 준회원의 차이', 'Difference between full and associate members'],
  ['닫기', 'Close'],
  ['아래 내용은 예시 문구이다. 단체 운영 기준에 맞게 수정하면 된다.', 'The content below is sample copy and can be adjusted to the organization rules.'],
  ['정회원(예시)', 'Full member (example)'],
  ['정기 회비 납부 또는 활동 기준 충족', 'Pays regular dues or meets activity requirements'],
  ['총회/의결권 등 운영 참여 가능', 'Can participate in governance, including general meetings and voting'],
  ['내부 자료/프로그램 우선 참여', 'Receives priority access to internal materials and programs'],
  ['준회원(예시)', 'Associate member (example)'],
  ['가입 절차 간소화(기본 정보 등록)', 'Simplified signup with basic information'],
  ['커뮤니티/공지 수신 및 일부 프로그램 참여', 'Can receive community notices and join some programs'],
  ['의결권은 없거나 제한될 수 있음', 'Voting rights may be unavailable or limited'],
  ['실제 기준(회비, 권한, 참여 범위)은 단체 규정에 따라 정리해 넣으면 된다.', 'Actual criteria such as dues, rights, and participation scope should follow the organization rules.'],
  ['자세히 보기', 'Read more'],

  ['단체소개', 'About Us'],
  ['빛나는 우리 청소년 성소수자 모임은 성적 지향과 성별 정체성으로 인해 혼자 고민하거나\n       위축되기 쉬운 청소년들이 안전하고 편안하게 자신을 표현할 수 있기 위해 결성된 단체입니다.\n       우리는 서로의 이야기를 존중하며 나누고, 차별과 혐오가 아닌 이해와 연대를 바탕으로 함께 성장하고자 합니다.\n       우리는 각자의 다름이 소중하다는 것을 배우며, 있는 그대로의 나를 긍정하고 지지받을 수 있는 경험을 만들어갑니다.\n       빛나는 우리는 혼자가 아니며, 함께일 때 더 단단해집니다.', 'Bichcheongmo is a group for LGBTQ youth who may feel isolated or discouraged because of sexual orientation or gender identity. We create a safe and comfortable space where young people can express themselves. We share our stories with respect and grow together through understanding and solidarity rather than discrimination or hate. We learn that our differences matter and build experiences where each person can affirm and be supported as they are. We are not alone, and we become stronger together.'],
  ['빛청모가 하는 일', 'What Bichcheongmo Does'],
  ['성소수자 관련 정보 공유 및 상호 지원', 'Shares LGBTQ-related information and mutual support'],
  ['권익 보호를 위한 연대 및 공조 활동', 'Builds solidarity and joint action to protect rights'],
  ['상담/연결(의료, 법률, 심리 등) 리소스 안내', 'Guides people to medical, legal, psychological, and other support resources'],
  ['커뮤니티 모임 및 SNS 운영', 'Runs community gatherings and social media channels'],
  ['회원 안내', 'Membership Guide'],
  ['회원 모집의 목적', 'Purpose of Membership Recruitment'],
  ['성소수자 의제, 청소년 의제에 대해 더욱 깊이있게 알아보고 이해할 수 있습니다.', 'Members can learn more deeply about LGBTQ and youth issues.'],
  ['다양한 사람들과 함께 활동하며 청소년이나 성소수자 이외의 소수자 집단에 대해 자세히 알 수 있습니다.', 'Members can work with diverse people and learn about minority groups beyond youth and LGBTQ communities.'],
  ['청소년 성소수자 이외의 다른 의제(청소년 노동권, 여성인권, 비인간 동물, 기후정의 등등)들을 잘 알 수 있습니다.', 'Members can also learn about other issues such as youth labor rights, women’s rights, non-human animals, and climate justice.'],
  ['정회원', 'Full member'],
  ['정회원은 우리 모임의 전반적인 활동에 적극 참여하고 활동하는 활동가로써 각종 행사 참여와 총회에서 임원으로써의 선거권/피선거권을 가지며 각종 월례/ 연례 자료를 제공받을 수 있습니다. 정기 회비 납부가 필수입니다.', 'Full members are active participants in the organization. They may take part in events, have voting and candidacy rights for officer roles at the general assembly, and receive monthly and annual materials. Regular membership dues are required.'],
  ['준회원', 'Associate member'],
  ['안전과 존중', 'Safety and Respect'],
  ['개인정보는 목적 외에 사용을 하지 않습니다.', 'Personal information is not used beyond its stated purpose.'],
  ['커뮤니티 가이드라인 기반의 운영을 하고 있습니다.', 'The community is operated based on community guidelines.'],
  ['혐오/차별/괴롭힘에 대해 반대합니다.', 'We oppose hate, discrimination, and harassment.'],
  ['빛청모 정관 보러가기', 'View Bichcheongmo Bylaws'],
  ['빛청모는 지정기부금 단체로의 지정을 추진하고있으며 관련 법률 및 정관에 따라 정관 본문을 공개합니다.', 'Bichcheongmo is pursuing designation as an eligible donation organization and publishes its bylaws according to relevant law and internal rules.'],
  ['정관 보러가기', 'View bylaws'],

  ['문의하기', 'Contact'],
  ['긴급한 사항은 아래 연락처로 문의주세요!', 'For urgent matters, please use the contacts below.'],
  ['연락처', 'Contacts'],
  ['대표메일', 'Main email'],
  ['사무국 웨이브팀 / 홍보소통팀', 'Secretariat Wave Team / PR & Communications Team'],
  ['사무국 기획조직팀 / 운영지원팀', 'Secretariat Planning & Organizing Team / Operations Support Team'],
  ['정치위원회', 'Political Committee'],
  ['전남광주통합특별시지부', 'Jeonnam-Gwangju Integrated Branch'],
  ['일반문의', 'General inquiries'],
  ['대표 박서영', 'Representative Park Seo-young'],
  ['부대표 금강', 'Vice Representative Geumgang'],

  ['빛청모 후원하기', 'Donate to Bichcheongmo'],
  ['빛청모를 후원해주세요. 여러분의 후원이 성소수자 커뮤니티를 더욱 강하게 만듭니다.', 'Support Bichcheongmo. Your contribution strengthens the LGBTQ community.'],
  ['후원 방법', 'Ways to Donate'],
  ['빛청모는 여러분의 후원을 기다리고 있습니다. 후원금은 다음과 같은 활동에 사용됩니다:', 'Bichcheongmo welcomes your support. Donations are used for the following activities:'],
  ['커뮤니티 모임 및 행사 운영', 'Operating community gatherings and events'],
  ['홍보용 굿즈 제작', 'Creating promotional goods'],
  ['퀴어 관련 행사 부스 운영', 'Running booths at queer-related events'],
  ['정기 후원', 'Recurring Donation'],
  ['일시 후원', 'One-Time Donation'],
  ['개발자 후원하기(별도)', 'Support the Developer (Separate)'],
  ['본 후원은 대한민국 민법 제554조에 따른 증여계약의 성격을 가지며, 후원자의 의사에 따라 개발자 개인에게 무상으로 제공되는 재산입니다.\n      후원금은 빛나는우리청소년성소수자모임에 대한 기부금이나 회비가 아니며, 단체의 재산 또는 회계에 편입되지 않습니다.\n      후원금은 홈페이지 개발, 유지보수, 서버 운영, 보안 관리 및 기타 기술적 활동을 수행하는 개발자 개인에게 직접 귀속되며, 대한민국 민법에 따라 개발자 개인의 재산으로 관리됩니다.\n      본 후원은 단체에 대한 후원과 법적으로 구분되며, 단체에 대한 기부 또는 후원을 희망하는 경우에는 별도의 빛나는우리청소년성소수자모임 후원 경로를 이용하여 주시기 바랍니다.', 'This support is a gift agreement under Article 554 of the Civil Act of the Republic of Korea. It is property provided free of charge to the individual developer according to the donor’s intent. These funds are not donations or membership dues for Shining Us, LGBTQ Youth, and are not included in the organization’s property or accounting. They belong directly to the individual developer who performs website development, maintenance, server operation, security management, and other technical work, and are managed as the developer’s personal property under Korean civil law. This support is legally separate from donations to the organization. If you wish to donate to the organization, please use the separate Bichcheongmo donation channel.'],
  ['개발자 후원금은 다음과 같은 활동에 사용됩니다:', 'Developer support is used for the following activities:'],
  ['사이트 수정 및 유지 보수비', 'Website updates and maintenance costs'],
  ['빛청모 산하 타 사이트 운영', 'Operation of other Bichcheongmo-related sites'],
  ['그 외의 개인 개발을 위한 자금', 'Other personal development costs'],
  ['개발자 후원', 'Support the Developer'],

  ['빛청모 정치위원회', 'Bichcheongmo Political Committee'],
  ['청소년의 정치적 권리를 선언하다', 'Declaring the political rights of youth'],
  ['우리는 침묵하지 않는다', 'We Will Not Be Silent'],
  ['청소년·성소수자·노동권 의제를 중심으로 정치적 실천을 이어갑니다.', 'We continue political action centered on youth, LGBTQ, and labor rights.']
]);

function normalizeText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

const normalizedLegacyKoToEn = new Map(
  Array.from(legacyKoToEn, ([ko, en]) => [normalizeText(ko), en])
);

export function translateText(value, language) {
  if (language !== 'en') return value;
  const translated = normalizedLegacyKoToEn.get(normalizeText(value));
  return translated || value;
}

export function translateLegacyHtml(html, language) {
  if (typeof DOMParser === 'undefined') return html;

  const doc = new DOMParser().parseFromString(`<template>${html}</template>`, 'text/html');
  const template = doc.querySelector('template');
  if (!template) return html;

  const headings = template.content.querySelectorAll('h1, h2, h3, h4, h5, h6, .region-branch-name');
  headings.forEach((el) => {
    const rawText = el.textContent || '';
    if (!el.getAttribute('data-ko-text')) {
      el.setAttribute('data-ko-text', rawText.trim());
    }
  });

  if (language === 'en') {
    const walker = doc.createTreeWalker(template.content, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    for (const node of textNodes) {
      const translated = translateText(node.nodeValue, language);
      if (translated !== node.nodeValue) node.nodeValue = translated;
    }

    for (const element of template.content.querySelectorAll('[aria-label], [alt], [title]')) {
      for (const attr of ['aria-label', 'alt', 'title']) {
        if (!element.hasAttribute(attr)) continue;
        element.setAttribute(attr, translateText(element.getAttribute(attr), language));
      }
    }
  }

  return template.innerHTML;
}
