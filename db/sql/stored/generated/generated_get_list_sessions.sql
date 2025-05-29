DROP TYPE IF EXISTS type_generated_get_list_sessions CASCADE;
CREATE TYPE type_generated_get_list_sessions AS (
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

-- セッション 一覧
-- 引数
--   p_uuid : UUID
--   p_user_uuid : ユーザーUUID
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
CREATE OR REPLACE FUNCTION generated_get_list_sessions (
  p_uuid UUID DEFAULT NULL
  ,p_user_uuid UUID DEFAULT NULL
  ,p_limit BIGINT DEFAULT NULL
  ,p_offset BIGINT DEFAULT 0
  ,p_with_count_flag BOOLEAN DEFAULT FALSE
) RETURNS SETOF type_generated_get_list_sessions AS $FUNCTION$
DECLARE
  w_record type_generated_get_list_sessions;
BEGIN
  IF p_with_count_flag IS TRUE THEN
    SELECT
      t1.uuid
      ,t1.user_uuid
      ,t1.created_uuid
      ,t1.updated_uuid
      ,t1.deleted_uuid
      ,t1.created_at
      ,t1.updated_at
      ,t1.deleted_at
      ,t1.created_pg
      ,t1.updated_pg
      ,t1.deleted_pg
      ,t1.bk
    INTO
      w_record
    FROM
      public.sessions AS t1
    LIMIT
      1
    ;
    IF NOT FOUND THEN
      RETURN;
    END IF;

    SELECT
      COUNT(*)::TEXT
    INTO
      w_record.bk
    FROM
      public.sessions AS t1
    WHERE
      (p_uuid IS NULL OR t1.uuid = p_uuid)
      AND (p_user_uuid IS NULL OR t1.user_uuid = p_user_uuid)
    ;
  END IF;

  RETURN QUERY SELECT
    t1.uuid
    ,t1.user_uuid
    ,t1.created_uuid
    ,t1.updated_uuid
    ,t1.deleted_uuid
    ,t1.created_at
    ,t1.updated_at
    ,t1.deleted_at
    ,t1.created_pg
    ,t1.updated_pg
    ,t1.deleted_pg
    ,t1.bk
  FROM
    public.sessions AS t1
  WHERE
    (p_uuid IS NULL OR t1.uuid = p_uuid)
    AND (p_user_uuid IS NULL OR t1.user_uuid = p_user_uuid)
  ORDER BY t1.created_at
  LIMIT
    p_limit
  OFFSET
    p_offset
  ;

  IF p_with_count_flag IS TRUE THEN
    RETURN NEXT w_record;
  END IF;
END;
$FUNCTION$ LANGUAGE plpgsql;