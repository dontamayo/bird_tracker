const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const app = express();
const PORT = 8000;
const knex = require('./db.js')


app.set('view engine', 'ejs');
app.use(morgan('combined'));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/birds/forms', (req, res) => {
  res.render('birds/forms', {
    title: 'make a new bird'
  });
})

/*
  GET ALL BIRDS
*/
app.get('/birds', (req, res) => {
knex('birds').then((rows) => {
    res.format({
      'application/json': () => res.json(rows),
      'text/html': () => res.render('birds/index', { birds: rows }),
      'default': () => res.sendStatus(406)
    });
  });
});

/*
  CREATE A BIRD
*/
app.post('/birds', (req, res) => {
  const {title, description} = req.body;

  const newBird = {
    title,
    description
  };

  knex('birds').insert(newBird). // INSERTS A NEW BIRD
  returning('*').then((rows) => {
    const bird = rows[0];

    res.json(bird);
  });
});

/*
  FETCH A BIRD
*/
app.get('/birds/:bird_id', (req, res) => {
  const birdId = req.params.bird_id;

 knex('birds')
 .where('id', birdId) // look for bird_id
 .then((rows) => {
   const foundBird = rows[0];

   res.format({
  'application/json': () => res.json(foundTodo),
  'text/html': () => res.render('birds/show', { bird: foundBird }),
  'default': () => res.sendStatus(406)
 })
})
.catch(() => {
 res.sendStatus(404);
});
});

/*
  PATCH A BIRD
*/
app.patch('/birds/:bird_id', (req, res) => {
  const birdId = req.params.bird_id;
const { title, description } = req.body;

knex('birds')
  .where('id', birdId)
  .returning('*')
  .update({ title, description })
  .then((rows) => {
    const bird = rows[0];

    res.json(bird);
  })
  .catch(() => {
    res.sendStatus(400);
  })
});

/*
  DELETE A BIRD
*/
app.delete('/birds/:bird_id', (req, res) => {
  knex('birds')
  .where('id', req.params.bird_id)
  .del()
  .then(() => res.sendStatus(204));
});

app.listen(PORT, () => console.log('Listening on', PORT, 'http://localhost:8000/birds/forms'))
