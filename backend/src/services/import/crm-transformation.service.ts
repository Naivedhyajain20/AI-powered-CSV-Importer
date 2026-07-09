import { parsePhone } from '../../utils/phone';
import { normalizeEmail } from '../../utils/email';
import { standardizeDate } from '../../utils/date';

export interface ICrmTransformationService {
  transform(records: Record<string, any>[]): Promise<Record<string, any>[]>;
}

export class CrmTransformationService implements ICrmTransformationService {
  async transform(records: Record<string, any>[]): Promise<Record<string, any>[]> {
    const transformed: Record<string, any>[] = [];

    for (const record of records) {
      const copy = { ...record };

      // 1. Multiple Emails: keep first, append rest to crm_note
      const rawEmail = copy.email ? String(copy.email).trim() : '';
      let emailParts: string[] = [];
      if (rawEmail) {
        emailParts = rawEmail.split(/[;,|\s]+/).map((e) => normalizeEmail(e)).filter(Boolean);
      }
      const primaryEmail = emailParts[0] || null;
      const remainingEmails = emailParts.slice(1);
      copy.email = primaryEmail;

      // 2. Multiple Phones: keep first, parse country/digits, append rest to crm_note
      const rawPhone = copy.mobile_without_country_code ?? copy.phone ?? '';
      let phoneParts: string[] = [];
      if (typeof rawPhone === 'string' || typeof rawPhone === 'number') {
        phoneParts = String(rawPhone).split(/[;,|]+/).map((p) => p.trim()).filter(Boolean);
      }
      const primaryPhoneStr = phoneParts[0] || '';
      const phoneResult = parsePhone(primaryPhoneStr);
      copy.country_code = phoneResult.countryCode || null;
      copy.mobile_without_country_code = phoneResult.mobileWithoutCountryCode || null;
      const remainingPhones = phoneParts.slice(1);

      // 3. Date Normalization
      copy.possession_time = copy.possession_time ? standardizeDate(String(copy.possession_time)) : null;
      copy.created_at = copy.created_at
        ? standardizeDate(String(copy.created_at)) || new Date().toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      // 4. CRM Status Constraints mapping to strict GrowEasy Enum
      const rawStatus = copy.crm_status ? String(copy.crm_status).trim().toLowerCase() : '';
      let matchedStatus = 'GOOD_LEAD_FOLLOW_UP'; // default fallback
      if (
        rawStatus.includes('good') ||
        rawStatus.includes('follow') ||
        rawStatus.includes('reschedule') ||
        rawStatus.includes('interest')
      ) {
        matchedStatus = 'GOOD_LEAD_FOLLOW_UP';
      } else if (
        rawStatus.includes('did not') ||
        rawStatus.includes('connect') ||
        rawStatus.includes('busy') ||
        rawStatus.includes('no answer')
      ) {
        matchedStatus = 'DID_NOT_CONNECT';
      } else if (
        rawStatus.includes('bad') ||
        rawStatus.includes('not interest') ||
        rawStatus.includes('disqualified') ||
        rawStatus.includes('junk') ||
        rawStatus.includes('trash')
      ) {
        matchedStatus = 'BAD_LEAD';
      } else if (
        rawStatus.includes('sale') ||
        rawStatus.includes('done') ||
        rawStatus.includes('close') ||
        rawStatus.includes('won') ||
        rawStatus.includes('onboard')
      ) {
        matchedStatus = 'SALE_DONE';
      } else {
        if (rawStatus === 'open') {
          matchedStatus = 'GOOD_LEAD_FOLLOW_UP';
        } else if (rawStatus === 'disqualified') {
          matchedStatus = 'BAD_LEAD';
        } else if (rawStatus === 'contacted') {
          matchedStatus = 'GOOD_LEAD_FOLLOW_UP';
        }
      }
      copy.crm_status = matchedStatus;

      // 5. Data Source matching
      const rawSource = copy.data_source ? String(copy.data_source).trim().toLowerCase() : '';
      let matchedSource = '';
      if (rawSource.includes('demand')) {
        matchedSource = 'leads_on_demand';
      } else if (rawSource.includes('meridian') || rawSource.includes('tower')) {
        matchedSource = 'meridian_tower';
      } else if (rawSource.includes('eden') || rawSource.includes('park')) {
        matchedSource = 'eden_park';
      } else if (rawSource.includes('varah') || rawSource.includes('swamy')) {
        matchedSource = 'varah_swamy';
      } else if (rawSource.includes('sarjapur') || rawSource.includes('plot')) {
        matchedSource = 'sarjapur_plots';
      }
      copy.data_source = matchedSource || null;

      // 6. Secondary Contact information merging into crm_note
      const extraNotes: string[] = [];
      if (remainingEmails.length > 0) {
        extraNotes.push(`Additional Emails: ${remainingEmails.join(', ')}`);
      }
      if (remainingPhones.length > 0) {
        extraNotes.push(`Additional Phones: ${remainingPhones.join(', ')}`);
      }
      if (extraNotes.length > 0) {
        const notesString = extraNotes.join(' | ');
        if (copy.crm_note && String(copy.crm_note).trim() !== '') {
          copy.crm_note = `${String(copy.crm_note).trim()} [${notesString}]`;
        } else {
          copy.crm_note = `[${notesString}]`;
        }
      }

      transformed.push(copy);
    }

    return transformed;
  }
}
