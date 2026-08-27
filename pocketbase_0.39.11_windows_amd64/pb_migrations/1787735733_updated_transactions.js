/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("txn_collection4")

  // update collection data
  unmarshal({
    "createRule": "",
    "listRule": "",
    "updateRule": "@request.auth.role = ''"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("txn_collection4")

  // update collection data
  unmarshal({
    "createRule": null,
    "listRule": null,
    "updateRule": "@request.auth.role = 'admin'"
  }, collection)

  return app.save(collection)
})
