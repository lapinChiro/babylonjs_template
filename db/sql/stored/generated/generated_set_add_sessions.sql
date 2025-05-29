DROP TYPE IF EXISTS type_generated_set_add_sessions CASCADE;
CREATE TYPE type_generated_set_add_sessions AS (
  uuid UUID
  ,user_uuid UUID
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

-- セッション 登録/更新
-- 引数
--   p_uuid : UUID
--   p_user_uuid : ユーザーUUID
--   p_now : 現在時間
--   p_pg : 実行プログラム名
--   p_operator_uuid : 実行者UUID
--   p_test_uuid : テスト用UUID
-- 戻り値
--   uuid : UUID
--   user_uuid : ユーザーUUID
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
CREATE OR REPLACE FUNCTION generated_set_add_sessions (
  p_uuid UUID DEFAULT NULL
  ,p_user_uuid UUID DEFAULT NULL
  ,p_now TIMESTAMPTZ DEFAULT NULL
  ,p_pg TEXT DEFAULT NULL
  ,p_operator_uuid UUID DEFAULT NULL
  ,p_test_uuid UUID DEFAULT NULL
  ,p_bk TEXT DEFAULT NULL
) RETURNS SETOF type_generated_set_add_sessions AS $FUNCTION$
DECLARE
  w_now TIMESTAMPTZ := COALESCE(p_now, NOW());
  w_pg TEXT := COALESCE(p_pg, 'generated_set_add_sessions');
  w_operator_uuid UUID := COALESCE(p_operator_uuid, '00000000-0000-0000-0000-000000000000');
  w_record type_generated_set_add_sessions;
BEGIN
  IF p_uuid IS NULL THEN
    INSERT INTO public.sessions (
      uuid
      ,user_uuid
      ,created_uuid
      ,updated_uuid
      ,created_at
      ,updated_at
      ,created_pg
      ,updated_pg
      ,bk
    ) VALUES (
      COALESCE(p_test_uuid, uv_uuid_v7())
      ,p_user_uuid
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
      ,user_uuid
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
    UPDATE public.sessions SET
      user_uuid = COALESCE(p_user_uuid, user_uuid)
      ,updated_uuid = w_operator_uuid
      ,updated_at = w_now
      ,updated_pg = w_pg
      ,bk = COALESCE(p_bk, bk)
    WHERE
      uuid = p_uuid
    RETURNING
      uuid
      ,user_uuid
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