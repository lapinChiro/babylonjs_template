DROP TYPE IF EXISTS type_generated_set_add_users CASCADE;
CREATE TYPE type_generated_set_add_users AS (
  uuid UUID
  ,user_code TEXT
  ,name TEXT
  ,mail TEXT
  ,last_login_at TIMESTAMPTZ
  ,created_uuid UUID
  ,updated_uuid UUID
  ,deleted_uuid UUID
  ,created_at TIMESTAMPTZ
  ,updated_at TIMESTAMPTZ
  ,deleted_at TIMESTAMPTZ
  ,created_pg TEXT
  ,updated_pg TEXT
  ,deleted_pg TEXT
  ,bk TEXT
);

-- ユーザー 登録/更新
-- 引数
--   p_uuid : UUID
--   p_user_code : ユーザーコード
--   p_name : 名前
--   p_mail : メール
--   p_last_login_at : 最終ログイン日時
--   p_now : 現在時間
--   p_pg : 実行プログラム名
--   p_operator_uuid : 実行者UUID
--   p_test_uuid : テスト用UUID
-- 戻り値
--   uuid : UUID
--   user_code : ユーザーコード
--   name : 名前
--   mail : メール
--   last_login_at : 最終ログイン日時
--   created_uuid : 登録者UUID
--   updated_uuid : 更新者UUID
--   deleted_uuid : 更新者UUID
--   created_at : 登録日時
--   updated_at : 更新日時
--   deleted_at : 更新日時
--   created_pg : 登録プログラム名
--   updated_pg : 更新プログラム名
--   deleted_pg : 更新プログラム名
--   bk : 備考
-- 例外
--   なし
CREATE OR REPLACE FUNCTION generated_set_add_users (
  p_uuid UUID DEFAULT NULL
  ,p_user_code TEXT DEFAULT NULL
  ,p_name TEXT DEFAULT NULL
  ,p_mail TEXT DEFAULT NULL
  ,p_last_login_at TIMESTAMPTZ DEFAULT NULL
  ,p_now TIMESTAMPTZ DEFAULT NULL
  ,p_pg TEXT DEFAULT NULL
  ,p_operator_uuid UUID DEFAULT NULL
  ,p_test_uuid UUID DEFAULT NULL
  ,p_bk TEXT DEFAULT NULL
) RETURNS SETOF type_generated_set_add_users AS $FUNCTION$
DECLARE
  w_now TIMESTAMPTZ := COALESCE(p_now, NOW());
  w_pg TEXT := COALESCE(p_pg, 'generated_set_add_users');
  w_operator_uuid UUID := COALESCE(p_operator_uuid, '00000000-0000-0000-0000-000000000000');
  w_record type_generated_set_add_users;
BEGIN
  IF p_uuid IS NULL THEN
    INSERT INTO public.users (
      uuid
      ,user_code
      ,name
      ,mail
      ,last_login_at
      ,created_uuid
      ,updated_uuid
      ,created_at
      ,updated_at
      ,created_pg
      ,updated_pg
      ,bk
    ) VALUES (
      COALESCE(p_test_uuid, uv_uuid_v7())
      ,COALESCE(p_user_code, '')
      ,COALESCE(p_name, '')
      ,COALESCE(p_mail, '')
      ,p_last_login_at
      ,w_operator_uuid
      ,w_operator_uuid
      ,w_now
      ,w_now
      ,w_pg
      ,w_pg
      ,p_bk
    ) 
    RETURNING
      uuid
      ,user_code
      ,name
      ,mail
      ,last_login_at
      ,created_uuid
      ,updated_uuid
      ,deleted_uuid
      ,created_at
      ,updated_at
      ,deleted_at
      ,created_pg
      ,updated_pg
      ,deleted_pg
      ,bk
    INTO
      w_record
    ;
    RETURN NEXT w_record;
  ELSE
    RETURN QUERY
    UPDATE public.users SET
      user_code = COALESCE(p_user_code, user_code)
      ,name = COALESCE(p_name, name)
      ,mail = COALESCE(p_mail, mail)
      ,last_login_at = COALESCE(p_last_login_at, last_login_at)
      ,updated_uuid = w_operator_uuid
      ,updated_at = w_now
      ,updated_pg = w_pg
      ,bk = COALESCE(p_bk, bk)
    WHERE
      uuid = p_uuid
    RETURNING
      uuid
      ,user_code
      ,name
      ,mail
      ,last_login_at
      ,created_uuid
      ,updated_uuid
      ,deleted_uuid
      ,created_at
      ,updated_at
      ,deleted_at
      ,created_pg
      ,updated_pg
      ,deleted_pg
      ,bk
    ;
  END IF;
END;
$FUNCTION$ LANGUAGE plpgsql;