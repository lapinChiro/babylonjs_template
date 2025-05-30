DROP TYPE IF EXISTS type_app_set_delete_login_session CASCADE;
CREATE TYPE type_app_set_delete_login_session AS (
  
);

CREATE OR REPLACE FUNCTION app_set_delete_login_session (
  p_session_uuid UUID DEFAULT NULL
  ,p_now TIMESTAMPTZ DEFAULT NULL
  ,p_pg TEXT DEFAULT NULL
  ,p_operator_uuid UUID DEFAULT NULL
) RETURNS SETOF type_app_set_delete_login_session AS $FUNCTION$
DECLARE
  w_now TIMESTAMPTZ := COALESCE(p_now, NOW());
  w_pg TEXT := COALESCE(p_pg, 'app_set_delete_login_session');
  w_operator_uuid UUID := COALESCE(p_operator_uuid, '00000000-0000-0000-0000-000000000000');
BEGIN
  RAISE NOTICE 'app_set_delete_login_session started p_session_uuid = %', p_session_uuid;

  DELETE FROM public.sessions AS t1
  WHERE
    t1.uuid = p_session_uuid
  ;
END;
$FUNCTION$ LANGUAGE plpgsql;