exports.up = function(knex, Promise) {
  return knex.schema.createTable("actions", tbl => {
    tbl.increments("id");
    tbl.string("name", 128).unique();
    tbl.string("description", 255);
    tbl.string("notes", 255);
    tbl.boolean("completed");
    tbl.integer('projects_id').unsigned();
    tbl.foreign('projects_id').references('projects.id')
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists("actions");
};
