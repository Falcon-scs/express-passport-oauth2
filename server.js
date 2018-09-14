
const express = require('express');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const routes = require('./routes');
const session = require('express-session');
const passport = require('passport');
const engine = require('ejs-locals');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const app = express();

require('dotenv').config();
require('./services/passport')(passport);

// DB Setup
const MONGOURL = process.env.MONGODB_URI || 'mongodb://localhost/auth';

mongoose.connect(MONGOURL, err => {
    console.log(err || `Connected to MongoDB: ${MONGOURL}`);
});
mongoose.Promise = global.Promise;


// App Setup

app.use(cors());
app.use(morgan('dev'));
app.use(express.static("public"));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
    secret: 'oauth2_scret',
    resave: true,
    saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash());   

app.use('/', routes);


app.use((err, req, res, next) => {
    console.log('Error:', err.message);
    res.status(422).json(err.message);
});

// view engine setup
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', './views');

// Server Setup
const port = process.env.PORT || 4000
http.createServer(app).listen(port, () => {
    console.log(`\x1b[32m`, `Server listening on: ${port}`, `\x1b[0m`)
});
