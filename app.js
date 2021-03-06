'use strict'

const               express = require('express')
	,              bodyParser = require('body-parser')
	,                   {red} = require('chalk')
	,                     app = express()
	,                    port = process.env.PORT || 3000
	,               {connect} = require('./db/database')
	,                  routes = require('./routes/')
	,                 session = require('express-session')
	,              RedisStore = require('connect-redis')(session)

// pug config
app.set('port', port)
app.set('view engine', 'pug')

// middlewarez
app.use(session({
	store: new RedisStore({
		url: process.env.REDIS_URL || 'redis://localhost:6379'
	}),
	secret: 'pizzapartysecret'
}))

app.use((req,res,next) => {
	app.locals.user = req.session.email
	next()
})

app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}))

app.locals.company = 'Pizza Go'
app.locals.errors = {} //errors & body added to avoid guard statements
app.locals.body = {} //i.e. value=(body && body.name) vs value=body.name

// routes
// express 4 version
app.use(routes)

// express 3 version
// routes(app)

// custrom 404 page
app.use((req, res, next) => {
	res.render('404')
})

// error handling middleware
app.use((err, {method, url, headers: {'user-agent': agent}}, res, next) => {
	// res.sendStatus(err. status || 500)
	// console.error(`[${Date()}]`, chalk.red(`${req.method} ${req.url}`), `Error(${chalk.red(res.statusCode)}): ${chalk.red(res.statusMessage)}`)
	// console.error(err.stack)
	if(process.env.NODE_ENV === 'production') {
		res.sendStatus(err.status || 500)
	} else {
		// res.set('Content-Type', 'text/plain').send(err.stack)
	}

	const timeStamp     = new Date()
	const statusCode    = res.statusCode
	const statusMessage = res.statusMessage

	console.error(
       `[${timeStamp}] "${red(`${method} ${url}`)}" Error (${statusCode}): "${statusMessage}"`
     )
  console.error(err.stack)
	next()
})


// connect to MONGODB, then initiate node/express to listen for incoming reqs 
connect()
	.then(() => {
		app.listen(port, () => {
			console.log(`Express server listening on port ${port}`)
		})
	})
	.catch(console.error)
