import { hwioMount } from './mount.js';
import { hwioGetAttribution, hwioGetPageAttribution } from './attribution.js';
import { hwioBuildSubmitPayload, hwioFoldMessageContext, hwioFormEventPayload, hwioGaClientId, hwioPageUri, type HWioFormEvent } from './forms-core.js';
import { hwioEnsureTurnstileToken, hwioResetTurnstile, type HWioTurnstileForm } from './turnstile.js';

export interface HWioSubmitResult { ok: boolean; status?: number; error?: string }

/**
 * Self-describing form contract (attributes stay compatible with the current sites):
 *   <form data-hs-form="contact" data-hs-form-guid="<HubSpot GUID>" data-hs-endpoint="https://submit.hardwario.com/api/submit"
 *         data-hs-event="generate_lead|newsletter_signup" data-hs-enrich="true"
 *         data-hs-sending-msg data-hs-success-msg data-hs-error-msg data-form-kind data-inquiry-source>
 *   inside: [data-hs-status] element, optional .cf-turnstile, optional [data-message-field data-message-label] controls.
 * `data-hs-enrich="true"` sends the HubSpot cookie, the stored attribution and the GA4 client id,
 * each gated on the matching consent category. Click ids in the current URL are always sent.
 */
async function readHubspotCookie(): Promise<string | undefined> {
  const store = (window as Window & { cookieStore?: { get: (n: string) => Promise<{ value: string } | undefined> } }).cookieStore;
  if (store) {
    try { return (await store.get('hubspotutk'))?.value; } catch { /* fall through */ }
  }
  return document.cookie.match(/(?:^|;\s*)hubspotutk=([^;]+)/)?.[1];
}

export async function hwioSubmitForm(form: HTMLFormElement, fields: Record<string, string>): Promise<HWioSubmitResult> {
  const endpoint = form.dataset.hsEndpoint;
  const formId = form.dataset.hsFormGuid;
  if (!endpoint || !formId) return { ok: false, error: 'form is missing data-hs-endpoint or data-hs-form-guid' };
  const locale = fields.hs_language || document.documentElement.lang.slice(0, 2) || 'en';
  const turnstileToken = fields['cf-turnstile-response'];
  delete fields['cf-turnstile-response'];

  const enrich = form.dataset.hsEnrich === 'true';
  const canEnrich = enrich && window.hwioConsent?.allows('marketing') === true;
  const canMeasure = enrich && window.hwioConsent?.allows('statistics') === true;
  const attribution: Record<string, string> = { ...(canEnrich ? hwioGetAttribution() : {}), ...hwioGetPageAttribution() };
  if (canMeasure) {
    const clientId = hwioGaClientId(document.cookie);
    if (clientId) attribution.ga_client_id = clientId;
  }
  const payload = hwioBuildSubmitPayload({
    formId,
    locale,
    turnstileToken,
    hutk: canEnrich ? await readHubspotCookie() : undefined,
    pageUri: hwioPageUri(window.location),
    pageName: document.title,
    fields,
    attribution,
  });
  try {
    const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      return { ok: false, status: res.status, error: detail || res.statusText };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}

function pushFormEvent(form: HTMLFormElement) {
  const event = form.dataset.hsEvent as HWioFormEvent | undefined;
  if (!event || !window.hwioConsent?.canTrack()) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(hwioFormEventPayload({
    event,
    formId: form.dataset.hsFormGuid ?? '',
    formName: form.dataset.hsForm ?? '',
    formKind: form.dataset.formKind,
    triggerLocation: form.dataset.inquirySource,
    pagePath: window.location.pathname,
  }));
}

export function hwioFormsRuntime() {
  function bind() {
    document.querySelectorAll<HTMLFormElement>('form[data-hs-form]').forEach((form) => {
      if (form.dataset.hsBound === 'true') return;
      form.dataset.hsBound = 'true';
      const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
      if (submitBtn && !submitBtn.dataset.originalText) submitBtn.dataset.originalText = submitBtn.textContent ?? '';

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const status = form.querySelector<HTMLElement>('[data-hs-status]');
        const sending = form.dataset.hsSendingMsg ?? '';
        const success = form.dataset.hsSuccessMsg ?? '';
        const error = form.dataset.hsErrorMsg ?? '';
        const original = submitBtn?.dataset.originalText ?? submitBtn?.textContent ?? '';
        if (submitBtn) { submitBtn.disabled = true; if (sending) submitBtn.textContent = sending; }
        if (status) { status.textContent = ''; status.classList.remove('hs-status-success', 'hs-status-error'); status.hidden = true; }

        await hwioEnsureTurnstileToken(form as HWioTurnstileForm);
        if (form.querySelector('.cf-turnstile') && !form.querySelector<HTMLInputElement>('input[name="cf-turnstile-response"]')?.value) {
          // The widget produced no token (script blocked, unsupported browser, timeout): say so instead of
          // sending a request the endpoint has to reject.
          hwioResetTurnstile(form as HWioTurnstileForm);
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = original; }
          if (status) { status.hidden = false; status.textContent = form.dataset.hsTurnstileMsg || error; status.classList.add('hs-status-error'); }
          console.error('form submission blocked: no Turnstile token');
          return;
        }
        let fields: Record<string, string> = {};
        for (const [name, value] of new FormData(form).entries()) if (typeof value === 'string') fields[name] = value;
        const context = Array.from(form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('[data-message-field]')).map((el) => ({
          name: el.name,
          label: el.dataset.messageLabel?.trim() ?? '',
          value: el.value,
        }));
        fields = hwioFoldMessageContext(fields, context);

        const result = await hwioSubmitForm(form, fields);
        hwioResetTurnstile(form as HWioTurnstileForm);
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = original; }
        if (status) {
          status.hidden = false;
          status.textContent = result.ok ? success : error;
          status.classList.add(result.ok ? 'hs-status-success' : 'hs-status-error');
        }
        if (result.ok) { pushFormEvent(form); form.reset(); }
        else console.error('form submission failed', result);
      });
    });
  }
  return hwioMount('forms', { bind, cleanup: () => {} });
}
