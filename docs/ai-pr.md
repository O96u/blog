# AI 改动流程

1. 只改任务要求的文件。不要顺手重排无关文章的日期。
2. 新文章保持 `draft: true`，除非任务明确要求发布。
3. 改完运行 `pnpm content:check`。有图片再运行 `pnpm images:process` 和 `pnpm images:verify`。
4. 用 `pnpm test` 覆盖排序、图片路径和搜索分词。
5. 需要看页面时运行 `pnpm generate`，再用 `pnpm preview` 和 `pnpm seo:audit`。
6. PR 说明里写清：改了哪些文章、是否发布、图片模式是否仍是 local。
7. 不要在 PR 或 CI 日志里放 OSS、SSH 或统计密钥。不要把上传图片放进普通 CI。
