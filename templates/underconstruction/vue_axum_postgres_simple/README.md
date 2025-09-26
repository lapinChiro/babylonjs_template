# vue_axum_postgres

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
PGPASSWORD=pass psql -h localhost -p 5433 -U user -d web
```

### URL

### フロントエンド

<http://localhost:5173/>
