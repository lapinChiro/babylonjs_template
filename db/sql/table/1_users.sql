DROP TABLE IF EXISTS public.users CASCADE;
CREATE TABLE public.users (
  uuid UUID NOT NULL DEFAULT uv_uuid_v7() -- UUID
  ,user_code TEXT NOT NULL DEFAULT '' -- ユーザーコード
  ,name TEXT NOT NULL DEFAULT '' -- 名前
  ,mail TEXT NOT NULL DEFAULT '' -- メール
  ,last_login_at TIMESTAMPTZ -- 最終ログイン日時
  ,created_uuid UUID
  ,updated_uuid UUID
  ,deleted_uuid UUID
  ,created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  ,updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  ,deleted_at TIMESTAMPTZ
  ,created_pg TEXT NOT NULL DEFAULT ''
  ,updated_pg TEXT NOT NULL DEFAULT ''
  ,deleted_pg TEXT NOT NULL DEFAULT ''
  ,bk TEXT
  ,PRIMARY KEY(uuid)
);

DROP TABLE IF EXISTS garbage.users CASCADE;
CREATE TABLE garbage.users (
  uuid UUID NOT NULL DEFAULT uv_uuid_v7() -- UUID
  ,user_code TEXT NOT NULL DEFAULT '' -- ユーザーコード
  ,name TEXT NOT NULL DEFAULT '' -- 名前
  ,mail TEXT NOT NULL DEFAULT '' -- メール
  ,last_login_at TIMESTAMPTZ -- 最終ログイン日時
  ,created_uuid UUID
  ,updated_uuid UUID
  ,deleted_uuid UUID
  ,created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  ,updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  ,deleted_at TIMESTAMPTZ
  ,created_pg TEXT NOT NULL DEFAULT ''
  ,updated_pg TEXT NOT NULL DEFAULT ''
  ,deleted_pg TEXT NOT NULL DEFAULT ''
  ,bk TEXT
  ,PRIMARY KEY(uuid)
);

