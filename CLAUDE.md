# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
アプリケーションのテンプレート

## ディレクトリ構成
### apps
アプリケーションのコードが置かれる

#### frontend
フロントエンドのコードが置かれる

#### services
バックエンドのコードが置かれる

##### api
バックエンドのAPIのコード

##### crates
共通部分のコード

###### common
設定情報などのコード

###### google_login
GoogleLoginのコード

###### logs
tracingのログのコード

###### postgresql
DBのテーブルを扱うコード

### bin
プロジェクトコマンド。開発に便利なCLI

### cli
プロジェクトコマンドの実装

### erd
設計関連の設計情報が置かれる。基本人間が修正する。

### db
データベース関連のファイルが置かれる

#### sql
SQLファイルが置かれる

##### lib
SQLのライブラリが置かれる

##### table
テーブル作成のSQLが置かれる

### development
ローカルの開発環境のDockerファイルなどが置かれる

### docs
アプリケーションの設計データが置かれる

#### typespec
APIに関するTypespec。フロントエンドのコードを生成する

## コード生成の注意
以下のフォルダーやファイルは人が作成するか、自動生成されるのでコードの変更やファイルの追加はしないでください。
- apps/frontend/src/api
- apps/frontend/src/helpers
- apps/frontend/src/models
- apps/frontend/src/templateServiceClient.ts
- bin
- cli
- erd
- db/sql
- apps/services/crates/postgresql/src/table
- docs
- development