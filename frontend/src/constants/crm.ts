export interface CrmFieldDefinition {
  field: string;
  label: string;
  description: string;
}

export const TARGET_CRM_FIELDS: CrmFieldDefinition[] = [
  { field: 'created_at', label: 'Created Date', description: 'When the record was first created' },
  { field: 'name', label: 'Name', description: 'Full name of the contact' },
  { field: 'email', label: 'Email Address', description: 'Primary contact email' },
  { field: 'country_code', label: 'Country Code', description: 'International dialing code prefix (e.g. +1, +91)' },
  { field: 'mobile_without_country_code', label: 'Mobile Number', description: 'Clean phone digits without country code' },
  { field: 'company', label: 'Company', description: 'Employer or organization name' },
  { field: 'city', label: 'City', description: 'City name' },
  { field: 'state', label: 'State', description: 'State, province, or region' },
  { field: 'country', label: 'Country', description: 'Country name' },
  { field: 'lead_owner', label: 'Lead Owner', description: 'Internal agent assigned to this lead' },
  { field: 'crm_status', label: 'CRM Status', description: 'GrowEasy status: GOOD_LEAD_FOLLOW_UP, DID_NOT_CONNECT, BAD_LEAD, SALE_DONE' },
  { field: 'crm_note', label: 'CRM Note', description: 'Additional notes or comments' },
  { field: 'data_source', label: 'Data Source', description: 'One of: leads_on_demand, meridian_tower, eden_park, varah_swamy, sarjapur_plots' },
  { field: 'possession_time', label: 'Possession Date', description: 'When the lead acquisition occurred' },
  { field: 'description', label: 'Description', description: 'Short description or summary of contact details' },
];
