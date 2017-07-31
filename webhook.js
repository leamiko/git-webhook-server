var path = require('path')
var fs = require('fs')
var exec = require('child_process').exec
var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var config = fs.existsSync(path.join(__dirname, './config.js')) ? require('./config.js') : require('./config.example.js')

app.use(bodyParser.json())

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
  if (req.get('X-Gitlab-Token')) {
    // gitlab
    let token = req.get('X-Gitlab-Token')
    handle(req, res, token)
  } else if (req.get('X-Coding-Event')) {
    // coding
    let token = req.get('token')
    handle(req, res, token)
  } else {
    return res.jsonHandle(1, 'unknow app')
  }
})

function handle (req, res, token) {
  var {
    object_kind,
    before,
    after,
    ref,
    checkout_sha,
    user_id,
    user_name,
    user_email,
    user_avatar,
    project_id,
    project,
    repository,
    commits,
    total_commits_count
  } = req.body

  var actions = config[req.path]

  if (!actions) {
    return res.jsonHandle(2, `path ${req.path} is notfound`)
  }

  if (token !== token) {
    return res.jsonHandle(3, `${req.path} token error`)
  }

  if (object_kind in actions) {
    execute(object_kind)
  } else if ('*' in actions) {
    execute('*')
  } else {
    return res.jsonHandle(4, `object_kind ${object_kind} is notfound`)
  }

  function execute (kind) {
    var shell = actions[kind]
    if (!actions[kind]) {
      return res.jsonHandle(`object_kind ${kind} is empty`)
    }

    try {
      shell = eval(`\`${actions[kind]}\``)
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
  res.status(500).jsonHandle(500, 'server exception')
})

var PORT = process.env.PORT || 13227
app.listen(PORT, '0.0.0.0', function () {
  console.log(`server listening at 0.0.0.0:${PORT}`)
})
