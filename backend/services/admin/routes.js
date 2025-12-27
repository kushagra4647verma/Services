router.use(authenticate);
router.use(requireRole(["admin"]));

router.get("/admin/restaurants", service.getAllRestaurants);
router.get("/admin/restaurants/:id", service.getRestaurantDetails);
router.post("/admin/restaurants/:id/verify", service.verifyRestaurant);
