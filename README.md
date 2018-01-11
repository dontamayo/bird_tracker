# Intro Web Apps
## A Bird Tracker
### node server.js or nodemon server.js


Our goals for this review are to

* Setup a migration for our `birds` table
* Write a RESTful CRUD server to manage our bird tracking.
  * Practice RESTful routing
  * Practice simple SQL queries using `knex`: select, insert, update, delete
* Utilize simple templates
* Utilize an express assets public folder
* Utilize forms to create new bird entries


### Project Setup

* `mkdir birds_play && cd birds_play`
* `git init`
* `touch .gitignore && echo './node_modules' > .gitignore`
* `git add . && git commit -m 'Create new node project'`
* `npm init -y`
* `git add . && git commit -m 'Add basic package.json'`
* `npm install --save express knex pg ejs body-parser morgan nodemon`
* `git add . && git commit -m 'Install express and related packages'`

### Questions

* Why do we install both `pg` and `knex`?
* What does `body-parser` allow us to do?

### Knex Setup

Begin by touching a `knexfile.js`

Make it look like the following:

```js
module.exports = {
  development: {
    client: 'pg',
    connection: 'postgres://localhost:5432/birds_play'
  }
};
```

Then create your `birds_play` db.

```shell
createdb birds_play
```


### Migrating Birds

Let's first create a simple birds table migration file

```shell
node_modules/.bin/knex migrate:make 'create_birds_table'
```

Then add your migration `up` and `down` descriptions.

```js
exports.up = function (knex, Promise) {
  return knex.schema.createTable('birds', (table) => {
    table.increments();
    table.string('title', 100).notNull();
    table.text('description');
    table.timestamps(true, true);
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('birds');
};
```

Then run your migration

```shell
node_modules/.bin/knex migrate:latest
```

### Questions

* Why do we care about knex migrations?
* Describe the role of `migrate:make`, `migrate:latest`, and `migrate:rollback`.

### Build Your RESTful Routes

| Request Method | Request Path | Typical Request Body | Typical Response Status | Typical Response Body |
| :--- | :---- | :---- | :---- | :---- |
| `GET` | `/birds` | none | `200` | an array of birds |
| `POST` | `/birds` |  data for a new bird | `201`  | the newly created bird |
| `GET` | `/birds/:bird_id` | none | `200` | the bird with the provided id |
| `PATCH` | `/birds/:bird_id` | the column data changed in the corresponding bird |  `200` | the updated bird |
| `DELETE` | `/birds/:bird_id` | none | `204` | no content |

#### Server


**NOTE**: The following server routes will not run and will hang if you try to go to them. **Be sure you understand why**.

`server.js`

```js
const express = require('express');
const app = express();
const PORT = 8000;

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

```

Then update your `package.json` to include the following start script:

```json
  "start": "nodemon server.js"
```

#### Exercises

* Setup your app to utilize `mogran` for logging.
* Setup your app to utlize `body-parser` for `json` parsing.
* Setup your app to utilize `ejs` for the view engine.
* **DOCS READING PRACTICE** Setup your app with a `public` folder and serve it using `express` static.


#### CRUD Server

Create a `db.js` file with the following in your project.

`db.js`

```js
const devConfig = require('./knexfile').development;
const knex = require('knex')(devConfig);

module.exports = knex;
```

Then require this from your server.js.


**NOTE**: be sure you created a `public` folder in your project for your `express` assets and a `views` folder for `ejs` rendering. If not run the following:

```shell
mkdir views
mkdir public
```

`server.js`

```js
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const app = express();
const PORT = 8000;

app.set('view engine', 'ejs');
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(express.static('public'));

/**** SETUP DB CONNECTION ****/
const knex = require('./db.js');


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

```

### Implementing CRUD


`server.js`

```js
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const app = express();
const PORT = 8000;

app.set('view engine', 'ejs');
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(express.static('public'));

/**** SETUP DB CONNECTION ****/
const knex = require('./db.js');

/*
  GET ALL BIRDS
*/
app.get('/birds', (req, res) => {
  knex('birds').then((rows) =>  res.json(rows));
});

/*
  CREATE A BIRD
*/
app.post('/birds', (req, res) => {
  const { title, description } = req.body;

  const newBird = {
    title,
    description
  };

  knex('birds')
    .insert(newBird) // INSERTS A NEW BIRD
    .returning('*')
    .then((rows) => {
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

    res.json(foundBird);
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

app.listen(PORT, () => console.log('Listening on', PORT))
```

### Templating

Let's utilize some templating to see a few different views:

| METHOD | PATH | View Has... |
| :--- | :--- | ---: |
| `GET` | `/birds/:bird_id` | Renders a bird html page |
| `GET` | `/birds` | Renders all birds in an html page |
| `GET` | `/birds/new` | Renders a form to create a new bird |
| `GET` | `/birds/:bird_id/edit` | Kind of a cool bonus/vanity route. Renders a form to edit a given bird |

We really only want the first three above.

Let's start with a view for a single `bird` using `/birds/bird_id`.

```shell
mkdir views/birds
touch views/birds/show.html
```

Then we can sketch out a template to view our bird.

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Show Bird</title>
  </head>
  <body>
    <h1>Show Bird</h1>
    <h2><%= bird.title %></h2>
    <p>
      <%= bird.description %>
    </p>
  </body>
</html>

```


Then we just update our routing response:

```js
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
     'application/json': () => res.json(foundBird),
     'text/html': () => res.render('/birds/show', { bird: foundBird }),
     'default': () => res.sendStatus(406)
    })
  })
  .catch(() => {
    res.sendStatus(404);
  });
});
```

#### Get All Birds

Create an index for your birds

```shell
touch views/birds/index.ejs
```

Then render your `index`.

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>All Birds</title>
  </head>
  <body>
    <h1>All Birds</h1>

    <% birds.forEach((bird) => { %>
     <h2><%= bird.title %></h2>
     <p>
       <%= bird.description %>
     </p>
    <% }) %>
  </body>
</html>

```

Then we render in our server route


```js
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

```

#### Exercise

* Write a `birds/new` and **MAKE A NEW ROUTE** for rendering it. **NOTE** you won't need to render any data with this view. Just focus on getting the `method` and `action` down. Then add `app.use(bodyParser.urlencoded({ extended: false })` to the top of your app. **DON'T** erase the `app.use(bodyParser.json())`.


#### Solution


`views/birds/new.ejs`

```html
<form method="POST" action="/birds">
 <input type="text" name="title"/>
 <textarea name="description">
 </textarea>

 <button>Save</button>
</form>
```


`server.js`


```js
app.get('/birds/new', (req, res) => {
  res.render('birds/new');
});
```

You can also update your `app.post`.


```js
app.post('/birds', (req, res) => {
  const { title, description } = req.body;

  const newBird = {
    title,
    description
  };

  knex('birds')
    .insert(newBird) // INSERTS A NEW BIRD
    .returning('*')
    .then((rows) => {
      const bird = rows[0];

      res.format({
        'application/json': () => res.json(bird),
        'text/html': () => res.redirect('/birds/' + bird.id),
        'default': () => res.sendStatus(406)
      })
    }).catch({
      res.format({
        'application/json': () => res.sendStatus(400),
        'text/html': () => res.redirect('/birds/new')
      })
    })
});

```
