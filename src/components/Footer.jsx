import { useLanguage } from '../state/LanguageContext.jsx';

export function Footer() {
  const { language } = useLanguage();
  const isEnglish = language === 'en';

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container footer-inner">
        <div className="card footer-legal">
          <p>
            {isEnglish
              ? '\u00A9 Shining Us (Business registration number 231-82-77851)'
              : '\u00A9 \uBE5B\uCCAD\uBAA8 (\uC0AC\uC5C5\uC790\uBC88\uD638 231-82-77851)'}
          </p>
          <p>Shining Us, LGBTQ Youth</p>
          <p>
            {isEnglish
              ? 'This organization is an unincorporated association registered with the competent tax office and does not engage in profit-making business outside its stated nonprofit purposes.'
              : '\uBCF8 \uB2E8\uCCB4\uB294 \uAD00\uD560 \uC138\uBB34\uC11C\uC5D0 \uB4F1\uB85D\uB41C \uC784\uC758\uB2E8\uCCB4\uB85C\uC368 \uACE0\uC720\uC0AC\uC5C5 \uC678\uC758 \uC218\uC775 \uC0AC\uC5C5\uC744 \uC601\uC704\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4'}
          </p>
          <p>
            <a href="./LICENSE">GPL-3.0-or-later</a>
            {' \u00B7 '}
            <a href="./THIRD_PARTY_NOTICES.md">
              {isEnglish ? 'Third-party license notices' : '\uC81C3\uC790 \uB77C\uC774\uC120\uC2A4 \uACE0\uC9C0'}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
