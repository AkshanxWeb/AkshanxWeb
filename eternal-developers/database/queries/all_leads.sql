-- Run with an authorized database client after connecting via server environment.
-- Never put a database password or API key in this file.
SELECT
    leads.id,
    leads.name,
    leads.email,
    leads.phone,
    leads.company,
    services.name AS service_requested,
    leads.project_brief,
    leads.budget_range,
    leads.desired_timeline,
    leads.source,
    leads.status,
    leads.contacted_at,
    leads.created_at,
    leads.updated_at
FROM leads
LEFT JOIN services ON services.id = leads.service_id
ORDER BY leads.created_at DESC, leads.id DESC;