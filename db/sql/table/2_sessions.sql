DROP TABLE IF EXISTS public.sessions CASCADE;
CREATE TABLE public.sessions (
  uuid UUID NOT NULL DEFAULT uv_uuid_v7() -- UUID
  ,user_uuid UUID NOT NULL -- ユーザーUUID
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

DROP TABLE IF EXISTS garbage.sessions CASCADE;
CREATE TABLE garbage.sessions (
  uuid UUID NOT NULL DEFAULT uv_uuid_v7() -- UUID
  ,user_uuid UUID NOT NULL -- ユーザーUUID
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

