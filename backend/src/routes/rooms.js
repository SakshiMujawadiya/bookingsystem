const { Router } = require('express');
const roomController = require('../controllers/roomController');

const router = Router();

router.get('/', roomController.getAllRooms);
router.post('/', roomController.createRoom);
router.get('/:id', roomController.getRoomById);
router.get('/:id/next-available', roomController.getNextAvailableSlot);

module.exports = router;
