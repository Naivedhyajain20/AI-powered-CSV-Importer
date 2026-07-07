export const TARGET_CRM_FIELDS = [
  'created_at',
  'name',
  'email',
  'country_code',
  'mobile_without_country_code',
  'company',
  'city',
  'state',
  'country',
  'lead_owner',
  'crm_status',
  'crm_note',
  'data_source',
  'possession_time',
  'description',
] as const;

export type TargetCrmField = typeof TARGET_CRM_FIELDS[number];

export const SYNONYM_DICTIONARY: Record<TargetCrmField, string[]> = {
  created_at: ['createdat', 'createddate', 'datecreated', 'timestamp', 'date'],
  name: ['name', 'fullname', 'customername', 'leadname', 'client', 'person'],
  email: ['email', 'emailaddress', 'mail', 'primaryemail'],
  country_code: ['countrycode', 'dialingcode', 'code'],
  mobile_without_country_code: ['mobile', 'phone', 'cell', 'contactnumber'],
  company: ['company', 'companyname', 'organization', 'org', 'employer'],
  city: ['city', 'town', 'municipality'],
  state: ['state', 'province', 'region'],
  country: ['country', 'nation'],
  lead_owner: ['leadowner', 'owner', 'assignedto', 'rep'],
  crm_status: ['crmstatus', 'status', 'stage', 'leadstatus'],
  crm_note: ['crmnote', 'note', 'notes', 'comment', 'comments'],
  data_source: ['datasource', 'source', 'origin', 'utm_source'],
  possession_time: ['possessiontime', 'dateacquired', 'acquiredat'],
  description: ['description', 'desc', 'summary', 'about'],
};
