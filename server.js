const express = require('express');
const morgan = require('morgan');
const body = require('body-parser');
const app = express();
const PORT = 8000;
const knex = require('./db.js')

app.use(morgan('combined'));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));


/*
  GET ALL BIRDS
*/
app.get('/birds', (req, res) => {});

/*
  CREATE A BIRD
*/
app.post('/birds', (req, res) => {});

/*
  FETCH A BIRD
*/
app.get('/birds/:bird_id', (req, res) => {});

/*
  PATCH A BIRD
*/
app.patch('/birds/:bird_id', (req, res) => {});

/*
  DELETE A BIRD
*/
app.delete('/birds/:bird_id', (req, res) => {});

app.listen(PORT, () => console.log('Listening on', PORT))
