# kyotango-akiya-notifier

https://kyotango-akiya.jp/ に空き家が追加されていたら通知してくれる LINE ボットです。

現在は **賃貸の空き家のみ** の更新通知を行っています。

GitHub Actions のワークフローでスケジュール実行しています。

## Development

```sh
# Run entire process.
$ deno run -A main.ts
# Run individual process.
$ deno run -A akiya-fetcher.ts
```
