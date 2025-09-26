# vue_rails_postgres

## NOTE

### コンテナ

#### コンテナ起動

```sh
docker compose up -d
```

#### コンテナ停止

```sh
docker compose stop
```

#### コンテナ削除

```sh
docker compose down -v
```

#### DBアクセス

```sh
PGPASSWORD=password psql -h  localhost -p 5435 -U postgres -d dev
```

### URL

### フロントエンド

<http://localhost:5173/>
