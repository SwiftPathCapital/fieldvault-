-- ============================================================
-- FIELDVAULT MULTI-TENANT CRM - SUPABASE SCHEMA
-- ============================================================

-- TENANTS
create table tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null, -- e.g. 'sunlight-contractors'
  logo_url text,
  phone text,
  email text,
  address text,
  created_at timestamptz default now()
);

-- USERS (extends Supabase auth.users)
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid references tenants(id) on delete cascade,
  role text not null check (role in ('superadmin', 'admin', 'staff')),
  first_name text,
  last_name text,
  email text,
  phone text,
  avatar_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- CLIENTS
create table clients (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade not null,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  address text,
  city text,
  state text,
  zip text,
  source text, -- 'website', 'referral', 'google', etc.
  status text default 'lead' check (status in ('lead', 'estimate', 'active', 'completed', 'lost')),
  tags text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- JOBS
create table jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade not null,
  client_id uuid references clients(id) on delete cascade not null,
  assigned_to uuid references users(id),
  title text not null,
  service_type text not null, -- 'spray_foam', 'blown_in', 'fireproofing', 'foundation', 'home_inspection', 'moisture_remediation', 'other'
  status text default 'new' check (status in ('new', 'estimate_sent', 'approved', 'scheduled', 'in_progress', 'completed', 'invoiced', 'cancelled')),
  job_address text,
  job_city text,
  job_state text,
  job_zip text,
  square_footage numeric,
  estimated_value numeric,
  actual_value numeric,
  product_used text,
  lot_numbers text,
  notes_summary text,
  scheduled_date date,
  completed_date date,
  follow_up_date date,
  review_requested boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- NOTES (polymorphic - attach to client or job)
create table notes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade not null,
  author_id uuid references users(id),
  client_id uuid references clients(id) on delete cascade,
  job_id uuid references jobs(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

-- TODOS
create table todos (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade not null,
  assigned_to uuid references users(id),
  client_id uuid references clients(id) on delete cascade,
  job_id uuid references jobs(id) on delete cascade,
  title text not null,
  is_done boolean default false,
  due_date date,
  priority text default 'normal' check (priority in ('low', 'normal', 'high')),
  created_at timestamptz default now()
);

-- CALENDAR EVENTS
create table calendar_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade not null,
  created_by uuid references users(id),
  assigned_to uuid references users(id),
  client_id uuid references clients(id) on delete set null,
  job_id uuid references jobs(id) on delete set null,
  title text not null,
  description text,
  start_time timestamptz not null,
  end_time timestamptz,
  event_type text default 'appointment' check (event_type in ('appointment', 'estimate', 'job', 'follow_up', 'other')),
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table tenants enable row level security;
alter table users enable row level security;
alter table clients enable row level security;
alter table jobs enable row level security;
alter table notes enable row level security;
alter table todos enable row level security;
alter table calendar_events enable row level security;

-- Helper function: get current user's role
create or replace function get_my_role()
returns text as $$
  select role from users where id = auth.uid();
$$ language sql security definer;

-- Helper function: get current user's tenant_id
create or replace function get_my_tenant_id()
returns uuid as $$
  select tenant_id from users where id = auth.uid();
$$ language sql security definer;

-- TENANTS: superadmin sees all, others see their own
create policy "superadmin sees all tenants" on tenants
  for all using (get_my_role() = 'superadmin');

create policy "users see own tenant" on tenants
  for select using (id = get_my_tenant_id());

-- USERS: superadmin sees all, others see own tenant
create policy "superadmin sees all users" on users
  for all using (get_my_role() = 'superadmin');

create policy "tenant members see own tenant users" on users
  for select using (tenant_id = get_my_tenant_id());

create policy "admin manages own tenant users" on users
  for all using (
    get_my_role() = 'admin' and tenant_id = get_my_tenant_id()
  );

-- CLIENTS
create policy "superadmin all clients" on clients
  for all using (get_my_role() = 'superadmin');

create policy "tenant scoped clients" on clients
  for all using (tenant_id = get_my_tenant_id());

-- JOBS
create policy "superadmin all jobs" on jobs
  for all using (get_my_role() = 'superadmin');

create policy "tenant scoped jobs" on jobs
  for all using (tenant_id = get_my_tenant_id());

-- NOTES
create policy "superadmin all notes" on notes
  for all using (get_my_role() = 'superadmin');

create policy "tenant scoped notes" on notes
  for all using (tenant_id = get_my_tenant_id());

-- TODOS
create policy "superadmin all todos" on todos
  for all using (get_my_role() = 'superadmin');

create policy "tenant scoped todos" on todos
  for all using (tenant_id = get_my_tenant_id());

-- staff only see todos assigned to them
create policy "staff sees own todos" on todos
  for select using (
    get_my_role() = 'staff' and assigned_to = auth.uid()
  );

-- CALENDAR EVENTS
create policy "superadmin all events" on calendar_events
  for all using (get_my_role() = 'superadmin');

create policy "tenant scoped events" on calendar_events
  for all using (tenant_id = get_my_tenant_id());

-- ============================================================
-- SEED: INSERT TENANT FOR SUNLIGHT + YOUR SUPERADMIN
-- (run after creating auth users in Supabase dashboard)
-- ============================================================

-- insert into tenants (name, slug, phone, email)
-- values ('Sunlight Contractors', 'sunlight-contractors', '504-919-9993', 'info@sunlightcontractors.com');

-- insert into users (id, tenant_id, role, first_name, last_name, email)
-- values ('<YOUR_AUTH_UID>', null, 'superadmin', 'Jordan', 'Bosh', 'jordan@swiftpathcapital.net');

-- insert into users (id, tenant_id, role, first_name, last_name, email)
-- values ('<DADS_AUTH_UID>', '<SUNLIGHT_TENANT_ID>', 'admin', 'Dad', 'LastName', 'dad@sunlightcontractors.com');
