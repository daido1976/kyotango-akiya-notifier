# kyotango-akiya-notifier

https://kyotango-akiya.jp/ に空き家が追加されていたら通知してくれる LINE ボットです。

現在は **売買の空き家** の更新通知を行っています。（一応選択可能にはしています）

GitHub Actions のワークフローでスケジュール実行しています。

## Development

```sh
# Run entire process.
$ deno run -A main.ts --kind=baibai
# Run individual process.
$ deno run -A internal/akiya-fetcher.ts
```
