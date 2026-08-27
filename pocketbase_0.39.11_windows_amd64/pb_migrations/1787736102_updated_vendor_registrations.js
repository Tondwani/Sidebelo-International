/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("vnd_collection3")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.role = ''"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("vnd_collection3")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.role = 'admin'"
  }, collection)

  return app.save(collection)
})
