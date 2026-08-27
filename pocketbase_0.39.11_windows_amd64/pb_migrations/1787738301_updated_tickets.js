/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("tkt_collection2")

  // update collection data
  unmarshal({
    "createRule": "status = 'issued'"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("tkt_collection2")

  // update collection data
  unmarshal({
    "createRule": null
  }, collection)

  return app.save(collection)
})
