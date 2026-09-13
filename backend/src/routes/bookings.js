const { Router } = require('express');
const bookingController = require('../controllers/bookingController');

const router = Router();

router.get('/', bookingController.getBookings);
router.post('/', bookingController.createBooking);
router.delete('/:id', bookingController.cancelBooking);

module.exports = router;
