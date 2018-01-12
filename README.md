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
# Bird Tracker
## Part II: Ajax

![bird_watching](https://media.giphy.com/media/a1cCNAOGJpupO/giphy.gif)

![bird watching image](https://www.anywhere.com/img-a/tour/rain-forest-birdwatching-tour-arenal-costa-rica/Rainforest-Birdwatching-Tour-A-4-jpg)

![bird_watching_owl](https://static.boredpanda.com/blog/wp-content/uploads/2014/10/owl-camouflage-disguise-30.jpg)

![bird_watching_tree_bird](https://i.ytimg.com/vi/mmiICy7Baqs/maxresdefault.jpg)

![bird_watching_big_bird](https://i.ytimg.com/vi/3OYuJKvr9f4/maxresdefault.jpg)

Previously, building our bird tracker we built a CRUD server to template and render json.

[SEE INTRO BIRD TRACKER](https://gist.github.com/OfTheDelmer/5ca876ab7b3cdcb83dce08e18ad51fa0)

This kind of CRUD SERVER can be used to create other apps like the canonical [Todo List App](https://cdn.dribbble.com/users/1200964/screenshots/3812962/todo_concept_iphonex_30fps.gif).

![todo_list](https://static1.squarespace.com/static/57922a859de4bbae635e3436/t/59dbbf17c534a5f2363aaa6c/1507573534700/source+%282%29.gif)

### Table Definition

`migrations/*_create_birds_table.js`

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

### Questions

* Why do we care about migrations?
* Describe the role of `up` and `down` for a migration file.
* What are `migrate:make`, `migrate:latest`, and `migrate:rollback` for?

### Server Code

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
  knex('birds').then((rows) => {
    res.format({
      'application/json': () => res.json(rows),
      'text/html': () => res.render('birds/index', { birds: rows }),
      'default': () => res.sendStatus(406)
    });
  });
});

/*
  FETCH A NEW FORM
*/
app.get('/birds/new', (req, res) => {
  res.render('birds/new');
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


#### Questions

* Describe the RESTful routes you'd need for a `pets` resource.
* What does `res.format` allow us to do?
* Describe what `app.use(express.static('public'))` is doing and what might go inside the public folder.

#### Code Break Downs

* Write the corresponding SQL for the following Knex query:

  ```js
   const query = knex('birds');
  ```
* Write the corresponding SQL for the following Knex query:

  ```js
   const newBird = { title: 'hello', description: 'world' };

   const query =  knex('birds')
      .insert(newBird)
      .returning('*');
  ```

* Write the corresponding SQL for the following Knex query:

  ```js
  const birdId = 12;
  const query = knex('birds').where('id', birdId);
  ```

* Write the corresponding SQL for the following Knex query:

  ```js
    const birdId = 12;
    const updatedBird = {
      title: 'hello',
      body: 'world'
    };

    knex('birds')
      .where('id', birdId)
      .returning('*')
      .update(updatedBird);

  ```

### Promises Check-In

* Explain `then` and `catch` in your own words.
* What happens when you return from a promise?

## Adding Scripts

Adding a `public` folder allows us to add all of our app assets.

```shell
mkdir public/stylesheets
touch public/stylesheets/site.css
```

Then you can link them to your app using the usual `img`, `link` or `script` tags.

### Making A Landing Page

Create a simple landing page for your application.

```shell
touch views/site/index.ejs
```

Add some basic html.

`views/site/index.ejs`

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Birdy</title>
  </head>
  <body>
    <h1>Welcome to our</h1>
  </body>
</html>

```

`server.js`

```js
app.get('/', (req, res) => {
  res.render('site/index');
});
```

Now add a simple application stylesheet.

```shell
touch public/stylesheets/site.css
```

In your `site.css` add some styling for your fonts.

`public/stylesheets/site.css`

```css
 @import url('https://fonts.googleapis.com/css?family=Macondo|Open+Sans');

 body {
  font-family: 'Open Sans', sans-serif;
 }

 h1, h2, h3, h4, h5, h6 {
  font-family: 'Macondo', cursive;
 }

```

Then on your `views/site/index.ejs` utilize a `link` tag to add the styling.

`views/site/index.ejs`

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <!-- Add site styling  -->
    <link rel="stylesheet" href="/stylesheets/site.css">
    <title>Birdy</title>
  </head>
  <body>
    <h1>Welcome to our</h1>
  </body>
</html>

```

You can also quickly add BootStrap to your project utilizing a CDN.

`views/site/index.ejs`

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <!-- Add Bootstrap CDN -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.3/css/bootstrap.min.css" integrity="sha384-Zug+QiDoJOrZ5t4lssLdxGhVrurbmBWopoEl+M6BdEfwnCJZtKxi1KgxUyJq13dy" crossorigin="anonymous">

    <!-- Add site styling -->
    <link rel="stylesheet" href="/stylesheets/site.css">
    <title>Birdy</title>
  </head>
  <body>
    <div class="container-fluid">
      <div class="jumbotron">
        <h1>Welcome to our</h1>
      </div>
    </div>
  </body>
</html>

```

### Exercises

* Add a `views/site/about.ejs` that also includes BootStrap and the `site.css`.
* Add a `views/site/contact.ejs` that also includes BootStrap and the `site.css`.

### EJS Resource

* [A Quick Intro To EJS and Partials](https://scotch.io/tutorials/use-ejs-to-template-your-node-application)

### Adding Scripts

Now Let's practice adding a script.

```shell
mkdir public/javascripts
touch public/javascripts/site.js
```

Then we can add some greeting spice...

`public/javascripts/site.js`

```js
  const { body } = document;
  let theta = 0;

  setInterval(() => {
    theta += 1;
    body.style.transform = `rotateX(${theta}deg)`;
  }, 20);
```

Then you can add this script to your landing page.

`views/site/index`

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <!-- Add Bootstrap CDN -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.3/css/bootstrap.min.css" integrity="sha384-Zug+QiDoJOrZ5t4lssLdxGhVrurbmBWopoEl+M6BdEfwnCJZtKxi1KgxUyJq13dy" crossorigin="anonymous">

    <!-- Add site styling -->
    <link rel="stylesheet" href="/stylesheets/site.css">
    <title>Birdy</title>
  </head>
  <body>
    <div class="container-fluid">
      <div class="jumbotron">
        <h1>Welcome to our</h1>
      </div>
    </div>
  </body>

  <!-- Add sitejs -->
  <script src="/javascripts/site.js" charset="utf-8"></script>
</html>

```

### Adding Dynamic Requests

Let's assume we did want to actually have to leave the `/birds` page to create a new bird. We could just add a form to our `birds/index.ejs`.

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>All Birds</title>
  </head>
  <body>
    <h1>All Birds</h1>

    <!-- New Bird Form -->
    <form id="newBirdForm" action="/birds" method="post">
      <div>
        <input id="title" type="text" name="title"/>
      </div>
      <div>
        <textarea id="description" name="description" rows="8" cols="80"></textarea>
      </div>

      <button>Save</button>
    </form>

    <div id="birds">
      <% birds.forEach((bird) => { %>
        <div>
          <h2> <%= bird.title %> </h2>
          <p> <%= bird.description %> </p>
        </div>
      <% }); %>
    </div>
  </body>
  <!-- SiteJS -->
  <script src="/javascripts/birds.js" charset="utf-8"></script>
</html>
```

Then we can add an event listener to the form.

`public/javascripts/bird.js` (Be sure to create this file)

```js
const birds = document.querySelector('#birds');
const newForm = document.querySelector('#newBirdForm');
const BIRDS_URL = 'localhost:8000/birds';

newForm.addEventListener('submit', (e) => {
  e.preventDefault(); // PREVENT DEFAULT ON FORM

  const data = entriesToObject(new FormData(newForm).entries());

  fetch(BIRDS_URL, {
    method: 'POST',
    body: JSON.stringify(data)
  }).then(res => res.json)
  .then((bird) => {
    const birdEl = document.createElement('div');

    birdEl.innerHTML = `<div>
      <h2>  ${bird.title} </h2>
      <p>  ${bird.description} </p>
    </div>`;

    birds.append(birdEl);

    newForm.clear();
  })
});

function entriesToObject(entries) {
  return [...entries].reduce((obj, [key, value]) => ({...obj, [key]: value}), {});
}
```

Or if you don't like that much ES6

`public/javascripts/site.js`

```js
const birds = document.querySelector('#birds');
const newForm = document.querySelector('#newBirdForm');
const BIRDS_URL = 'localhost:8000/birds';

newForm.addEventListener('submit', (e) => {
  e.preventDefault(); // PREVENT DEFAULT ON FORM

  const data = {
    title: newForm.querySelector('#title').value,
    description: newForm.querySelector('#description').value
  };

  fetch(BIRDS_URL, {
    method: 'POST',
    body: JSON.stringify(data)
  }).then(res => res.json)
  .then((bird) => {
    const birdEl = document.createElement('div');

    birdEl.innerHTML = `<div>
      <h2>  ${bird.title} </h2>
      <p>  ${bird.description} </p>
    </div>`;

    birds.append(birdEl);

    newForm.reset();
  })
});
```

### Exercise

* Refactor the `views/birds/index.ejs` to utilize an ajax request to load all the birds and append them to the page. Delete the templating from the `views/birds/index.ejs.`.
