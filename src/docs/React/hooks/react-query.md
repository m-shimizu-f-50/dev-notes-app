# tanstack/react-query（旧 React Query）導入のメリットと実践例

## 背景

従来は各コンポーネントごとに `useEffect` と `axios` で API 通信を実装し、ローディングやエラー管理も分散していました。その結果、
- コードが複雑化し保守性が低下
- 複数画面（一覧・詳細・更新など）で同じデータを扱う際、**データ同期のズレ**が頻発

特に、データ更新後に画面をまたいだ際、状態が古いまま残る問題がありました。

## React Query 導入による解決

React Query（現 tanstack/react-query）を導入することで、以下の課題が解消されました。

### 1. データ取得・管理の一元化
- API 通信、ローディング・エラー状態の管理をフックで統一
- 各画面で同じ Query Key を使うことで、データの一貫性を担保

### 2. 自動再フェッチによる同期ズレ解消
- データ更新後、`invalidateQueries` で該当 Query Key を無効化
- 一覧画面などで自動的に最新データを再取得
- 画面間のデータ同期ズレがなくなる

## 実践例

### 一覧・詳細・更新画面でのデータ同期

```tsx
// 一覧データ取得
const { data: items, isLoading, error } = useQuery({
  queryKey: ['items'],
  queryFn: fetchItems,
});

// 更新処理
const mutation = useMutation({
  mutationFn: updateItem,
  onSuccess: () => {
    // 一覧データの Query Key を invalidate して自動再フェッチ
    queryClient.invalidateQueries({ queryKey: ['items'] });
  },
});
```

- 更新画面で `mutation` 成功時に `invalidateQueries(['items'])` を呼ぶだけで、一覧画面のデータが自動で最新化される
- 手動で state を更新したり再取得ロジックを書く必要がなくなる

## まとめ

React Query の導入により、
- API 通信・状態管理の一元化
- 画面間のデータ同期ズレの解消
- 保守性・可読性の向上

特に Query Key を使った自動再フェッチは、複数画面で同じデータを扱う場合に非常に有効です。

---

参考: [tanstack/react-query 公式ドキュメント](https://tanstack.com/query/latest)
