DROP TYPE IF EXISTS type_app_set_add_login_session CASCADE;
CREATE TYPE type_app_set_add_login_session AS (
  session_uuid UUID
);

CREATE OR REPLACE FUNCTION app_set_add_login_session (
  p_user_code TEXT DEFAULT NULL
  ,p_name TEXT DEFAULT NULL
  ,p_mail TEXT DEFAULT NULL
  ,p_now TIMESTAMPTZ DEFAULT NULL
  ,p_pg TEXT DEFAULT NULL
  ,p_operator_uuid UUID DEFAULT NULL
) RETURNS SETOF type_app_set_add_login_session AS $FUNCTION$
DECLARE
  w_now TIMESTAMPTZ := COALESCE(p_now, NOW());
  w_pg TEXT := COALESCE(p_pg, 'app_set_add_login_session');
  w_operator_uuid UUID := COALESCE(p_operator_uuid, '00000000-0000-0000-0000-000000000000');
  w_user_uuid UUID;
BEGIN
  RAISE NOTICE 'app_set_add_login_session started p_user_code = %, p_name = %, p_mail = %', p_user_code, p_name, p_mail;

  -- ユーザー取得
  SELECT 
    t1.uuid 
  INTO 
    w_user_uuid
  FROM 
    generated_get_list_users(
      p_user_code := p_user_code
    ) AS t1
  ;

  -- ユーザーと登録または更新
  SELECT
    t1.uuid
  INTO
    w_user_uuid
  FROM generated_set_add_users(
    p_uuid := w_user_uuid
    ,p_user_code := p_user_code
    ,p_name := p_name
    ,p_mail := p_mail
    ,p_last_login_at := w_now
    ,p_now := w_now
    ,p_pg := w_pg
    ,p_operator_uuid := w_operator_uuid
  ) AS t1;

  -- セッション登録
  RETURN QUERY
  SELECT 
    t1.uuid
  FROM
    generated_set_add_sessions(
      p_user_uuid := w_user_uuid
      ,p_expire_at := w_now + INTERVAL '1 day'
      ,p_now := w_now
      ,p_pg := w_pg
      ,p_operator_uuid := w_operator_uuid
    ) AS t1
  ;
END;
$FUNCTION$ LANGUAGE plpgsql;