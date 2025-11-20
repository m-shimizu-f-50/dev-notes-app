# Dev Notes App

開発で使うサンプルコードと実装方法を Markdown で管理するための React アプリです。

## 特徴

- 📝 **Markdown ファイルを直接リポジトリに配置** - GitHub でそのまま綺麗に読める
- 🚀 **React アプリから一覧・閲覧** - ブラウザで快適に閲覧・検索
- 🎨 **最小限のレイアウト** - 自分用に最適化されたシンプルな UI
- 📁 **階層構造に対応** - カテゴリごとに自動グループ化

## 使い方

### 1. セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

### 2. Markdown ファイルの追加

`src/docs/` 配下に Markdown ファイルを配置します。

```
src/docs/
  ├── React/
  │   └── hooks/
  │       └── useRef.md
  ├── TypeScript/
  │   └── types.md
  └── その他のカテゴリ/
      └── ノート.md
```

ファイルを追加すると、自動的にアプリに反映されます。

### 3. 閲覧

- **一覧ページ** (`/`) - カテゴリごとにノート一覧を表示
- **詳細ページ** (`/note/{パス}`) - 個別のノートを閲覧

## 技術スタック

- **React 19** - UI ライブラリ
- **TypeScript** - 型安全性
- **Vite** - ビルドツール
- **React Router** - ルーティング
- **react-markdown** - Markdown レンダリング
- **remark-gfm** - GitHub Flavored Markdown 対応

## プロジェクト構成

```
src/
  ├── docs/              # Markdownファイルを配置
  ├── components/        # コンポーネント
  │   ├── Layout.tsx
  │   └── MarkdownViewer.tsx
  ├── pages/            # ページコンポーネント
  │   ├── NoteListPage.tsx
  │   └── NotePage.tsx
  └── notesMap.ts        # Markdownファイルの読み込み処理
```

## コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# ビルド結果のプレビュー
npm run preview

# リンター実行
npm run lint
```

## ライセンス

個人利用・学習目的
