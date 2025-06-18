DROP TYPE IF EXISTS type_app_set_check_login_session CASCADE;
CREATE TYPE type_app_set_check_login_session AS (
  user_uuid UUID
  ,name TEXT
  ,mail TEXT
);

CREATE OR REPLACE FUNCTION app_set_check_login_session (
  p_session_uuid UUID DEFAULT NULL
  ,p_now TIMESTAMPTZ DEFAULT NULL
  ,p_pg TEXT DEFAULT NULL
  ,p_operator_uuid UUID DEFAULT NULL
) RETURNS SETOF type_app_set_check_login_session AS $FUNCTION$
DECLARE
  w_now TIMESTAMPTZ := COALESCE(p_now, NOW());
  w_pg TEXT := COALESCE(p_pg, 'app_set_check_login_session');
  w_operator_uuid UUID := COALESCE(p_operator_uuid, '00000000-0000-0000-0000-000000000000');
  w_user_uuid UUID;
BEGIN
  RAISE NOTICE 'app_set_check_login_session started p_session_uuid = %', p_session_uuid;

  -- 過去のセッションを削除
  DELETE FROM
    garbage.sessions
  WHERE
    expire_at < w_now
  ;

  -- セッションの破棄時間を更新
  UPDATE public.sessions SET
    expire_at = w_now + INTERVAL '1 day'
    ,updated_uuid = w_operator_uuid
    ,updated_at = w_now
    ,updated_pg = w_pg
  WHERE
    uuid = p_session_uuid
  RETURNING 
    user_uuid 
  INTO 
    w_user_uuid;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  RETURN QUERY
    SELECT
      t1.uuid
      ,t1.name
      ,t1.mail
    FROM
      public.users AS t1
    WHERE
      t1.uuid = w_user_uuid
  ;
END;
$FUNCTION$ LANGUAGE plpgsql;