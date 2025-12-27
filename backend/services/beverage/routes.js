router.get("/restaurants/:id/beverages", service.getAll);
router.post("/restaurants/:id/beverages", service.create);
router.get("/beverages/:id", service.getOne);
router.patch("/beverages/:id", service.update);
router.delete("/beverages/:id", service.remove);
