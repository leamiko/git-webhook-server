非常简单的 git webhook 服务，支持 gitlab 和 coding。

## 配置 config.json

```js
{
  "/test": {  // 请求路径
    "token": "123",  // token
    "*": "./bin/test.sh",  // 默认执行的脚本
    "push": "./bin/test.sh"  // 指定某个 action 执行的脚本
  }
}
```

## 启动服务

```
node app.js

or

pm2 start webhook.js

// server listening at 0.0.0.0:13227
```

默认端口 13227，可通过 export PORT 指定其他端口

## Actions

```
push
tag_push
issue
note
merge_request
wiki_page
pipeline
build
```