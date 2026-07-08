export const FEW_SHOT_EXAMPLES = [
  {
    input: [
      {
        name: "John Doe",
        email: "JOHN@example.com; admin@example.com",
        mobile_without_country_code: "+1 (555) 019-2834",
        company: "Acme Corp",
        city: "New York",
        state: "NY",
        country: "USA",
        lead_owner: "Sarah Connor",
        crm_status: "open",
        crm_note: "Met at conference",
        data_source: "Webinar",
        possession_time: "05/12/2026",
        created_at: "2026-07-08T03:31:38Z",
        description: "Hot prospect"
      }
    ],
    output: [
      {
        name: "John Doe",
        email: "john@example.com",
        country_code: "+1",
        mobile_without_country_code: "5550192834",
        company: "Acme Corp",
        city: "New York",
        state: "NY",
        country: "USA",
        lead_owner: "Sarah Connor",
        crm_status: "GOOD_LEAD_FOLLOW_UP",
        crm_note: "Met at conference [Additional Emails: admin@example.com]",
        data_source: null,
        possession_time: "2026-05-12",
        created_at: "2026-07-08",
        description: "Hot prospect"
      }
    ]
  }
];
