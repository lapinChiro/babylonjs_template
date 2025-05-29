DROP TYPE IF EXISTS type_generated_set_delete_sessions CASCADE;
CREATE TYPE type_generated_set_delete_sessions AS (
  uuid UUID
);

-- レコード 削除
-- 引数
--   p_uuid : UUID
--   p_now : 現在時刻
--   p_pg : プログラム名
--   p_operator_uuid : 実行者UUID
-- 戻り値
--   uuid : レシートUUID
-- 例外
--   なし
CREATE OR REPLACE FUNCTION generated_set_delete_sessions (
  p_uuid UUID DEFAULT NULL
  ,p_now TIMESTAMPTZ DEFAULT NULL
  ,p_pg TEXT DEFAULT NULL
  ,p_operator_uuid UUID DEFAULT NULL
) RETURNS SETOF type_generated_set_delete_sessions AS $FUNCTION$
DECLARE
  w_now TIMESTAMPTZ := COALESCE(p_now, NOW());
  w_pg TEXT := COALESCE(p_pg, 'generated_set_delete_sessions');
  w_operator_uuid UUID := COALESCE(p_operator_uuid, '00000000-0000-0000-0000-000000000000');
BEGIN
  -- パラメーターチェック
  PERFORM
    uv_check_invalid_parameter(
      p_invalid_flag := p_uuid IS NULL
    );

  -- garbageスキーマへ移動
  PERFORM
    dyn_set_save_garbage(
      p_target_uuid := t1.uuid
      ,p_src_table_name := 'sessions'
      ,p_dst_table_name := 'sessions'
      ,p_now := w_now
      ,p_sp := w_pg
      ,p_caller_uuid := w_operator_uuid
      ,p_uuid_column_name := 'uuid'
      ,p_delete_column_name := 'deleted'
    )
  FROM
    public.sessions AS t1
  WHERE
    t1.uuid = p_uuid
  ;

  RETURN QUERY
  SELECT
    p_uuid;
END;
$FUNCTION$ LANGUAGE plpgsql;