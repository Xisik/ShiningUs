import { useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '../state/LanguageContext.jsx';

const feedbackTypes = ['siteError', 'contentFix', 'accessibility', 'other'];
const endpoint = import.meta.env.VITE_FEEDBACK_ENDPOINT || '';
const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';
const turnstileScriptUrl = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

const text = {
  ko: {
    title: '피드백',
    description: '사이트 오류, 내용 수정, 접근성 문제 등 개선이 필요한 내용을 알려주세요. 이름과 연락처는 받지 않습니다.',
    typeLabel: '유형',
    messageLabel: '내용',
    messagePlaceholder: '확인할 수 있도록 구체적으로 적어 주세요.',
    submit: '제출하기',
    submitting: '제출 중...',
    success: '피드백이 저장되었습니다.',
    endpointMissing: '피드백 저장 API가 아직 연결되지 않았습니다.',
    captchaMissing: '피드백 보안 인증이 아직 연결되지 않았습니다.',
    captchaRequired: '보안 인증을 완료해 주세요.',
    error: '제출에 실패했습니다. 잠시 후 다시 시도해 주세요.',
    tooShort: '내용은 5자 이상 입력해 주세요.',
    tooLong: '내용은 2000자 이내로 입력해 주세요.',
    siteError: '사이트 오류',
    contentFix: '내용 수정',
    accessibility: '접근성',
    other: '기타'
  },
  en: {
    title: 'Feedback',
    description: 'Tell us about site bugs, content corrections, accessibility issues, or other improvements. We do not collect your name or contact information.',
    typeLabel: 'Type',
    messageLabel: 'Message',
    messagePlaceholder: 'Please describe the issue clearly enough for us to check.',
    submit: 'Submit',
    submitting: 'Submitting...',
    success: 'Your feedback has been saved.',
    endpointMissing: 'The feedback API is not connected yet.',
    captchaMissing: 'The feedback security check is not connected yet.',
    captchaRequired: 'Please complete the security check.',
    error: 'Submission failed. Please try again later.',
    tooShort: 'Please enter at least 5 characters.',
    tooLong: 'Please keep the message under 2000 characters.',
    siteError: 'Site bug',
    contentFix: 'Content correction',
    accessibility: 'Accessibility',
    other: 'Other'
  }
};

function getValidationMessage(copy, message) {
  const normalized = message.trim();
  if (normalized.length < 5) return copy.tooShort;
  if (normalized.length > 2000) return copy.tooLong;
  return '';
}

export function FeedbackPage() {
  const { language } = useLanguage();
  const copy = text[language] || text.ko;
  const turnstileRef = useRef(null);
  const turnstileWidgetId = useRef(null);
  const [type, setType] = useState(feedbackTypes[0]);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle');
  const [notice, setNotice] = useState(endpoint ? (turnstileSiteKey ? '' : copy.captchaMissing) : copy.endpointMissing);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileLoaded, setTurnstileLoaded] = useState(false);

  const validationMessage = useMemo(
    () => (message.trim() ? getValidationMessage(copy, message) : ''),
    [copy, message]
  );
  const disabled = !endpoint || !turnstileSiteKey || !turnstileToken || status === 'submitting' || Boolean(validationMessage) || !message.trim();

  useEffect(() => {
    if (!endpoint && status !== 'submitting') {
      setNotice(copy.endpointMissing);
    } else if (!turnstileSiteKey && status !== 'submitting') {
      setNotice(copy.captchaMissing);
    }
  }, [copy.captchaMissing, copy.endpointMissing, status]);

  useEffect(() => {
    if (!turnstileSiteKey) return undefined;

    if (window.turnstile) {
      setTurnstileLoaded(true);
      return undefined;
    }

    const existingScript = document.querySelector(`script[src="${turnstileScriptUrl}"]`);
    const script = existingScript || document.createElement('script');
    script.src = turnstileScriptUrl;
    script.async = true;
    script.defer = true;
    script.addEventListener('load', () => setTurnstileLoaded(true));

    if (!existingScript) {
      document.head.appendChild(script);
    }

    return undefined;
  }, []);

  useEffect(() => {
    if (!turnstileLoaded || !turnstileSiteKey || !turnstileRef.current || !window.turnstile || turnstileWidgetId.current) {
      return undefined;
    }

    turnstileWidgetId.current = window.turnstile.render(turnstileRef.current, {
      sitekey: turnstileSiteKey,
      size: 'flexible',
      callback: (token) => setTurnstileToken(token),
      'expired-callback': () => setTurnstileToken(''),
      'error-callback': () => setTurnstileToken('')
    });

    return () => {
      if (window.turnstile && turnstileWidgetId.current) {
        window.turnstile.remove(turnstileWidgetId.current);
        turnstileWidgetId.current = null;
      }
    };
  }, [turnstileLoaded]);

  function resetTurnstile() {
    setTurnstileToken('');
    if (window.turnstile && turnstileWidgetId.current) {
      window.turnstile.reset(turnstileWidgetId.current);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextValidationMessage = getValidationMessage(copy, message);
    if (nextValidationMessage) {
      setStatus('error');
      setNotice(nextValidationMessage);
      return;
    }
    if (!turnstileToken) {
      setStatus('error');
      setNotice(copy.captchaRequired);
      return;
    }

    setStatus('submitting');
    setNotice('');

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, message: message.trim(), turnstileToken })
      });
      if (!response.ok) throw new Error(`Feedback request failed: ${response.status}`);
      setStatus('success');
      setMessage('');
      setType(feedbackTypes[0]);
      resetTurnstile();
      setNotice(copy.success);
    } catch {
      setStatus('error');
      resetTurnstile();
      setNotice(copy.error);
    }
  }

  return (
    <main className="feedback-page container">
      <section className="page-header">
        <h1>{copy.title}</h1>
        <p>{copy.description}</p>
      </section>

      <form className="feedback-form card" onSubmit={handleSubmit}>
        <label className="feedback-field">
          <span>{copy.typeLabel}</span>
          <select value={type} onChange={(event) => setType(event.target.value)}>
            {feedbackTypes.map((item) => (
              <option key={item} value={item}>{copy[item]}</option>
            ))}
          </select>
        </label>

        <label className="feedback-field">
          <span>{copy.messageLabel}</span>
          <textarea
            value={message}
            maxLength={2000}
            rows={8}
            placeholder={copy.messagePlaceholder}
            onChange={(event) => {
              setMessage(event.target.value);
              if (status !== 'submitting') {
                setStatus('idle');
                setNotice(endpoint ? (turnstileSiteKey ? '' : copy.captchaMissing) : copy.endpointMissing);
              }
            }}
          />
        </label>

        {turnstileSiteKey ? <div className="feedback-turnstile" ref={turnstileRef} /> : null}

        <div className="feedback-actions">
          <p className={`feedback-notice${status === 'success' ? ' is-success' : ''}${status === 'error' || !endpoint ? ' is-error' : ''}`} aria-live="polite">
            {validationMessage || (!turnstileToken && endpoint && turnstileSiteKey && message.trim() ? copy.captchaRequired : notice)}
          </p>
          <button className="btn btn-primary" type="submit" disabled={disabled}>
            {status === 'submitting' ? copy.submitting : copy.submit}
          </button>
        </div>
      </form>
    </main>
  );
}
