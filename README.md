非常简单的 git webhook 服务，目前仅支持 Gitlab。

## 配置 config.json

拷贝 config.example.json 到 config.json。

```js
{
  "/test": {  // 请求路径
    "token": "123",  // token
    "*": "./bin/test.sh",  // 默认执行的脚本
    "push": "./bin/test.sh ${project.name}"  // push 时执行的脚本，支持部分变量读取，参考下方变量
  }
}
```

## 变量

* `EVENT` 事件 e.g: push
* `REF` 分支 e.g: refs/heads/master
* `PROJECT_NAME` 仓库名称
* `PROJECT_NAMESPACE` 仓库分组，在 Github 中是指用户名
* `GIT_SSH_URL` 仓库 SSH 地址
* `GIT_HTTP_URL` 仓库 HTTP 地址
* `GIT_HTTPS_URL` 仓库 HTTPS 地址

## 启动服务

```bash
node webhook.js
```

默认端口 13227，可通过 export PORT 指定其他端口。

## 资料

* [GitLab Documentation](https://docs.gitlab.com/ee/user/project/integrations/webhooks.html#webhooks)
* [Coding 开放平台（后期版本支持）](https://open.coding.net/webhook.html)
* [GitHub Developer（后期版本支持）](https://developer.github.com/webhooks/#events)
* [Github Webhooks Events](https://developer.github.com/v3/activity/events/types/#pushevent)
