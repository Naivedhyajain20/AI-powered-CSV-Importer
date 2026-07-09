export const CRM_EXTRACTION_PROMPT_TEMPLATE = `You are a data conversion API. Your task is to process the provided input JSON records and map/normalize them to strictly conform to the GrowEasy CRM schema. Do NOT write code or scripts. Output ONLY the converted data.

Target CRM Fields Schema:
- name: (string, required) Full name of the contact.
- email: (string, optional) Cleaned email address.
- country_code: (string, optional) Dialing code prefix (e.g., "+1", "+91").
- mobile_without_country_code: (string, optional) Mobile number digits only.
- company: (string, optional) Company name.
- city: (string, optional) City name.
- state: (string, optional) State/province name.
- country: (string, optional) Country name.
- lead_owner: (string, optional) Name of the assigned lead owner.
- crm_status: (string, required) One of: "GOOD_LEAD_FOLLOW_UP", "DID_NOT_CONNECT", "BAD_LEAD", "SALE_DONE".
- crm_note: (string, optional) Remarks, comments, extra numbers, extra emails, or context.
- data_source: (string, optional) One of: "leads_on_demand", "meridian_tower", "eden_park", "varah_swamy", "sarjapur_plots". Leave empty/null if none match.
- possession_time: (string, optional) Date standard formatted as YYYY-MM-DD.
- created_at: (string, optional) Date standard formatted as YYYY-MM-DD.
- description: (string, optional) Short description or summary.

Normalization Rules:
1. Emails: Extract the primary email (first email) to 'email'. Any additional emails must be appended into 'crm_note'.
2. Phones: Extract the primary phone number, parsing country code (e.g. "+91") to 'country_code' and digits to 'mobile_without_country_code'. Additional phones must be appended into 'crm_note'.
3. Dates: Normalize dates to ISO YYYY-MM-DD format.
4. CRM Status: Clean and map strictly to one of: "GOOD_LEAD_FOLLOW_UP", "DID_NOT_CONNECT", "BAD_LEAD", "SALE_DONE".
5. Data Source: Map to one of the 5 allowed source strings, or leave blank if none match.
6. CRM Note: Append secondary contact details (additional emails/phones) and extra remarks.

Input JSON Records to process:
{{records}}

Few-Shot Reference Examples:
{{fewShots}}

CRITICAL CONSTRAINT:
- Return ONLY a valid JSON object with a single key "records" containing an array of objects conforming to the CRM schema.
- Example Output format: { "records": [ { "name": "...", "crm_status": "..." } ] }
- Do NOT write javascript code. Do NOT wrap the JSON inside markdown code blocks.
- The output must be directly parseable by JSON.parse().`;
