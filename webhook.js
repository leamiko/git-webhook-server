var path = require('path')
var fs = require('fs')
var exec = require('child_process').exec
var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var config = fs.existsSync(path.join(__dirname, './config.js')) ? require('./config.js') : require('./config.example.js')

app.use(bodyParser.json({
  // 有些仓库首次拉取时，文件数量特别多，对应的 commits 也会特别长，
  // 很可能会超过 bodyParser 默认 100kb 的限制。
  // 如果程序抛出 request entity too large 异常，可再适当加大。
  limit: '10mb'
}))

app.use(function (req, res, next) {
  res.jsonHandle = function (code = 0, message = '', data = null) {
    var err = { code, message, data }
    if (code > 0) console.error(err)
    res.json(err)
  }
  next()
})

app.get('*', function (req, res, next) {
  res.jsonHandle(0, 'git webhook server')
})

app.post('*', function (req, res, next) {
  if (req.get('X-Gitlab-Event')) {
    // gitlab
    let token = req.get('X-Gitlab-Token')
    handle(res, req.path, token, {
      EVENT: req.body.object_kind,
      REF: req.body.ref,
      PROJECT_NAME: req.body.project.name,
      PROJECT_NAMESPACE: req.body.project.namespace,
      GIT_SSH_URL: req.body.project.git_ssh_url,
      GIT_HTTP_URL: req.body.project.git_http_url,
      GIT_HTTPS_URL: req.body.project.git_https_url
    })
  } else if (req.get('X-Coding-Event')) {
    // coding
    // let token = req.get('token')
    return res.jsonHandle(1, 'unknow app')
  } else {
    return res.jsonHandle(1, 'unknow app')
  }
})

function handle (res, pathname, token = '', info) {
  const { EVENT, REF, PROJECT_NAME, PROJECT_NAMESPACE, GIT_SSH_URL, GIT_HTTP_URL, GIT_HTTPS_URL } = info

  var actions = config[pathname]

  if (!actions) {
    return res.jsonHandle(2, `path ${pathname} is notfound`)
  }

  if (token !== actions.token) {
    return res.jsonHandle(3, `${pathname} token error`)
  }

  if (EVENT in actions) {
    execute(EVENT)
  } else if ('*' in actions) {
    execute('*')
  } else {
    return res.jsonHandle(4, `event ${EVENT} is notfound`)
  }

  function execute (_event) {
    var shell = actions[_event]
    if (!shell) {
      return res.jsonHandle(`event ${_event} is empty`)
    }

    try {
      shell = eval(`\`${actions[_event]}\``)
    } catch (e) {
      return res.jsonHandle(5, `shell expression error`, e)
    }

    exec(shell, {
      cwd: __dirname,
    }, function (err, stdout, stderr) {
      if (err) {
        return res.jsonHandle(6, `exec error: ${err}`)
      }
      console.log('execute success', new Date ().toString())
      if (stdout) {
        console.log(stdout)
      }
      res.jsonHandle(0, 'execute success')
    })
  }
}

app.use(function (err, req, res, next) {
  console.error(err)
  res.status(500).json({
    code: 500,
    message: 'server exception',
    data: null
  })
})

var PORT = process.env.PORT || 13227
app.listen(PORT, '0.0.0.0', function () {
  console.log(`server listening at 0.0.0.0:${PORT}`)
})
