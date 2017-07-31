非常简单的 git webhook 服务，目前仅支持 Gitlab。

## 配置 config.json

拷贝 config.example.json 到 config.json。

```js
{
  "/test": {  // 请求路径
    "token": "123",  // token
    "*": "./bin/test.sh",  // 默认执行的脚本
    "push": "./bin/test.sh ${project.name}"  // push 时执行的脚本，支持变量读取，参考 gitlab.request.body.example.js
  }
}
```

## 启动服务

```bash
node webhook.js
```

默认端口 13227，可通过 export PORT 指定其他端口。

## 资料

* [GitLab Documentation](https://docs.gitlab.com/ee/user/project/integrations/webhooks.html#webhooks)
* [Coding 开放平台（后期版本支持）](https://open.coding.net/webhook.html)
* [GitHub Developer（后期版本支持）](https://developer.github.com/webhooks/#events)
