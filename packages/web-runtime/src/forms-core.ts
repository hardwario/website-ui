export interface HWioSubmitInput {
  formId: string;
  locale: string;
  turnstileToken?: string;
  hutk?: string;
  pageUri: string;
  pageName: string;
  fields: Record<string, string>;
  attribution?: Record<string, string>;
}

/** The JSON body accepted by the website-forms Worker (submit.hardwario.com / submit.enerooo.cz). */
export function hwioBuildSubmitPayload(input: HWioSubmitInput) {
  const attribution = input.attribution && Object.keys(input.attribution).length ? input.attribution : undefined;
  return {
    formId: input.formId,
    locale: input.locale,
    turnstileToken: input.turnstileToken,
    hutk: input.hutk,
    pageUri: input.pageUri,
    pageName: input.pageName,
    fields: input.fields,
    attribution,
  };
}

/** Origin + pathname only: keeps raw query-string click ids out of HubSpot's hs_context. */
export function hwioPageUri(location: { origin: string; pathname: string }): string {
  return location.origin + location.pathname;
}

/** GA4 client id from the _ga cookie value (GA1.1.<client id> -> last two dot groups). */
export function hwioGaClientId(cookieHeader: string): string | undefined {
  const ga = cookieHeader.match(/(?:^|;\s*)_ga=([^;]+)/)?.[1];
  const clientId = ga ? ga.split('.').slice(-2).join('.') : '';
  return /^\d+\.\d+$/.test(clientId) ? clientId : undefined;
}

/**
 * Folds UI-only qualification fields into the message field ("Label: value" lines) so small
 * HubSpot forms need no extra properties. Returns the new fields object.
 */
export function hwioFoldMessageContext(fields: Record<string, string>, context: { name: string; label: string; value: string }[]): Record<string, string> {
  const out = { ...fields };
  const lines: string[] = [];
  for (const item of context) {
    if (item.value.trim()) lines.push(`${item.label || item.name}: ${item.value.trim()}`);
    if (item.name) delete out[item.name];
  }
  if (lines.length) {
    const original = out.message?.trim();
    out.message = `${lines.join('\n')}${original ? `\n\n${original}` : ''}`.slice(0, 5000);
  }
  return out;
}

export type HWioFormEvent = 'generate_lead' | 'newsletter_signup';

export function hwioFormEventPayload(input: { event: HWioFormEvent; formId: string; formName: string; formKind?: string; triggerLocation?: string; pagePath: string }) {
  return {
    event: input.event,
    form_id: input.formId,
    form_name: input.formName,
    form_kind: input.formKind ?? input.formName,
    ...(input.triggerLocation ? { trigger_location: input.triggerLocation } : {}),
    page_path: input.pagePath,
  };
}
