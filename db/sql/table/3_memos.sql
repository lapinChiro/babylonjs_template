DROP TABLE IF EXISTS public.memos CASCADE;
CREATE TABLE public.memos (
  uuid UUID NOT NULL DEFAULT uv_uuid_v7() -- UUID
  ,user_uuid UUID NOT NULL -- ユーザーUUID
  ,title TEXT NOT NULL DEFAULT '' -- タイトル
  ,content TEXT NOT NULL DEFAULT '' -- 内容
  ,parent_memo_uuid UUID NOT NULL -- 親メモUUID
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

  ,FOREIGN KEY (user_uuid) REFERENCES users(uuid)
);

DROP TABLE IF EXISTS garbage.memos CASCADE;
CREATE TABLE garbage.memos (
  uuid UUID NOT NULL DEFAULT uv_uuid_v7() -- UUID
  ,user_uuid UUID NOT NULL -- ユーザーUUID
  ,title TEXT NOT NULL DEFAULT '' -- タイトル
  ,content TEXT NOT NULL DEFAULT '' -- 内容
  ,parent_memo_uuid UUID NOT NULL -- 親メモUUID
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

