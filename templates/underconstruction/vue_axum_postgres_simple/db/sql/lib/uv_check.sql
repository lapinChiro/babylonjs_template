-- パラメーターをチェックする
-- 引数
--   p_integer_value_ary : 数値配列
--   p_text_value_ary : 文字列配列
--   p_invalid_flag : その他エラー判定
-- 戻り値
-- 例外
--   U0002 : 引数エラー
CREATE OR REPLACE FUNCTION uv_check_invalid_parameter(
  p_integer_value_ary BIGINT[] DEFAULT NULL
  ,p_text_value_ary TEXT[] DEFAULT NULL
  ,p_invalid_flag BOOLEAN DEFAULT FALSE
  ,p_message TEXT DEFAULT 'Invalid parameter'
) RETURNS VOID AS $FUNCTION$
DECLARE
  w_result BOOLEAN := FALSE;
BEGIN
  IF p_integer_value_ary IS NOT NULL THEN
    FOR i IN 1..array_length(p_integer_value_ary, 1) LOOP
      IF p_integer_value_ary[i] IS NULL OR p_integer_value_ary[i] < 1 THEN
        w_result := TRUE;
        EXIT;
      END IF;
    END LOOP;
  END IF;

  IF p_text_value_ary IS NOT NULL THEN
    FOR i IN 1..array_length(p_text_value_ary, 1) LOOP
      IF p_text_value_ary[i] IS NULL OR p_text_value_ary[i] = '' THEN
        w_result := TRUE;
        EXIT;
      END IF;
    END LOOP;
  END IF;

  IF w_result = TRUE OR p_invalid_flag = TRUE THEN
    RAISE SQLSTATE 'U0002' USING MESSAGE = p_message;
  END IF;
END;
$FUNCTION$ LANGUAGE plpgsql;
