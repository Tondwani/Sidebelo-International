/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("txn_collection4")

  // update collection data
  unmarshal({
    "listRule": null
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("txn_collection4")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.role = 'admin'"
  }, collection)

  return app.save(collection)
})
