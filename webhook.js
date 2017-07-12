var path = require('path')
var fs = require('fs')
var exec = require('child_process').exec
var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var config = fs.existsSync(path.join(__dirname, './config.json')) ? require('./config.json') : require('./config.example.json')

app.use(bodyParser.json())

app.get('*', function (req, res, next) {
  res.json({
    code: 0,
    message: 'git webhook server'
  })
})

app.post('*', function (req, res, next) {
  if (req.get('X-Gitlab-Token')) {
    // gitlab
    let token = req.get('X-Gitlab-Token')
    handle(req, res, next, token)
  } else if (req.get('X-Coding-Event')) {
    // coding
    let token = req.get('token')
    handle(req, res, next, token)
  } else {
    res.json({
      code: 1,
      message: 'unknow app'
    })
    return
  }
})

function handle (req, res, next) {
  var body = req.body
  var token = req.get('X-Gitlab-Token')
  var action = body.object_kind
  var data = config[req.path]

  if (!data) {
    console.error(`path ${req.path} is notfound`)
    res.json({
      code: 2,
      message: `path ${req.path} is notfound`
    })
    return
  }

  if (token !== token) {
    console.error('token error')
    res.json({
      code: 3,
      message: 'token error'
    })
    return
  }

  if (action in data) {
    execute(action)
  } else if ('*' in data) {
    execute('*')
  } else {
    console.error(`action ${action} is notfound`)
  }

  function execute (action) {
    var shell = data[action]
    if (!shell) {
      res.json({
        code: 4,
        message: 'action ${action} is empty'
      })
      return
    }
    exec(shell, {
      cwd: __dirname
    }, function (err, stdout, stderr) {
      if (err) {
        console.error(`exec error: ${err}`)
        res.json({
          code: 5,
          message: `exec error: ${err}`
        })
        return
      }
      console.log('exec success')
      console.log(stdout)
      res.json({
        code: 0,
        message: 'exec success'
      })
    })
  }
}

app.use(function (err, req, res, next) {
  console.error(err)
  res.end('server exception')
})

var PORT = process.env.PORT || 13227
app.listen(PORT, '0.0.0.0', function () {
  console.log(`server listening at 0.0.0.0:${PORT}`)
})
