# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
- 全ての対話、説明、提案は日本語で行ってください。
- Node.jsプロジェクトである。
- JavaScript言語を使用すること。
- 必要なパッケージがある場合は、`npm install`をのコマンドを提示するだけにとどめ、実際のインストールはユーザーが行う。

## System Directory Protection
システムの安定性を維持するため、以下のディレクトリおよびその配下のファイルに対する**変更・追加・削除・移動操作を一切禁止**します。

### 操作禁止対象（Read-Only or No Access）
* `/usr/`
* `/bin/`
* `/sbin/`
* `/etc/`
* `/var/`
* `/Library/`
* `/System/`

### 遵守すべきガイドライン
1. **書き込み禁止:** 上記パスに対して `sudo`, `rm`, `mv`, `cp`, `tee`, `chmod` 等のコマンドを実行したり、書き込みを伴う編集を提案したりしないでください。
2. **調査限定:** 動作確認や環境調査のために内容を読み取る（`cat`, `ls`）ことは許可しますが、管理者権限が必要な操作はスキップしてください。

## Commands

```bash
# Install dependencies (once added)

# Run tests (once configured)
npm test

# ソース構造
- projectルート/
  ├── node_modules/       : Node.jsモジュールディレクトリ
  ├── package.json        : Node.jsプロジェクト設定ファイル
  ├── package-lock.json   : npm管理ファイル
  ├── src/                : サーバーソースコード格納ディレクトリ
  │    └── index.js       : エントリーポイント（起動用ファイル）
  └── public/             : ブラウザ確認用チャットクライアントソースディレクトリ
       └── index.html     : ブラウザ確認用チャットクライアントルHTML/JavaScript

## Current State
