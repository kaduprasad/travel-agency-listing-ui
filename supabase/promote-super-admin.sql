-- =====================================================================
-- Bootstrap the super admin (you)
-- AFTER creating your auth user in Supabase Dashboard -> Authentication
-- -> Users -> "Add user", run this with your email substituted.
-- =====================================================================
update public.profiles
set role = 'super_admin',
    agency_id = (select id from public.agencies where slug = 'skyline-travels')
where id = (select id from auth.users where email = 'CHANGE_ME@example.com');
