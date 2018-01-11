exports.up = function (knex, Promise) {
  return knex.schema.createTable('birds', (table) => {
    table.increments();
    table.string('title', 100).notNull();
    table.text('description');
    table.timestamps();
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('birds');
};
