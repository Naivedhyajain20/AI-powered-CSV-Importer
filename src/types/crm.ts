export interface CrmLead {
  id?: string;
  name: string;
  email: string;
  mobile: string;
  company?: string;
  status?: 'Open' | 'Contacted' | 'Disqualified';
}

export interface CrmContact {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  ownerId?: string;
}
