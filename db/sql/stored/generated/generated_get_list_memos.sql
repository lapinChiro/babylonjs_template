DROP TYPE IF EXISTS type_generated_get_list_memos CASCADE;
CREATE TYPE type_generated_get_list_memos AS (
  uuid UUID
  ,user_uuid UUID
  ,title TEXT
  ,content TEXT
  ,parent_memo_uuid UUID
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

-- メモ 一覧
-- 引数
--   p_uuid : UUID
--   p_user_uuid : ユーザーUUID
--   p_title : タイトル
--   p_content : 内容
--   p_parent_memo_uuid : 親メモUUID
-- 戻り値
--   uuid : UUID
--   user_uuid : ユーザーUUID
--   title : タイトル
--   content : 内容
--   parent_memo_uuid : 親メモUUID
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
CREATE OR REPLACE FUNCTION generated_get_list_memos (
  p_uuid UUID DEFAULT NULL
  ,p_user_uuid UUID DEFAULT NULL
  ,p_title TEXT DEFAULT NULL
  ,p_content TEXT DEFAULT NULL
  ,p_parent_memo_uuid UUID DEFAULT NULL
  ,p_limit BIGINT DEFAULT NULL
  ,p_offset BIGINT DEFAULT 0
  ,p_with_count_flag BOOLEAN DEFAULT FALSE
) RETURNS SETOF type_generated_get_list_memos AS $FUNCTION$
DECLARE
  w_record type_generated_get_list_memos;
BEGIN
  IF p_with_count_flag IS TRUE THEN
    SELECT
      t1.uuid
      ,t1.user_uuid
      ,t1.title
      ,t1.content
      ,t1.parent_memo_uuid
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
      public.memos AS t1
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
      public.memos AS t1
    WHERE
      (p_uuid IS NULL OR t1.uuid = p_uuid)
      AND (p_user_uuid IS NULL OR t1.user_uuid = p_user_uuid)
      AND (p_title IS NULL OR t1.title = p_title)
      AND (p_content IS NULL OR t1.content = p_content)
      AND (p_parent_memo_uuid IS NULL OR t1.parent_memo_uuid = p_parent_memo_uuid)
    ;
  END IF;

  RETURN QUERY SELECT
    t1.uuid
    ,t1.user_uuid
    ,t1.title
    ,t1.content
    ,t1.parent_memo_uuid
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
    public.memos AS t1
  WHERE
    (p_uuid IS NULL OR t1.uuid = p_uuid)
    AND (p_user_uuid IS NULL OR t1.user_uuid = p_user_uuid)
    AND (p_title IS NULL OR t1.title = p_title)
    AND (p_content IS NULL OR t1.content = p_content)
    AND (p_parent_memo_uuid IS NULL OR t1.parent_memo_uuid = p_parent_memo_uuid)
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