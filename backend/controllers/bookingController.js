// Cancel Booking (Owner)
const cancelBookingOwner = async (req, res) => {
    try {
      const ownerId = req.session.ownerId;
      const { id } = req.params;
  
      const [bookings] = await db.query(`
        SELECT b.*, p.owner_id 
        FROM bookings b
        JOIN properties p ON b.property_id = p.id
        WHERE b.id = ?
      `, [id]);
  
      if (bookings.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }
  
      const booking = bookings[0];
  
      if (booking.owner_id !== ownerId) {
        return res.status(403).json({
          success: false,
          message: 'You can only cancel bookings for your own properties'
        });
      }
  
      if (booking.status === 'CANCELLED') {
        return res.status(400).json({
          success: false,
          message: 'Booking is already cancelled'
        });
      }
  
      await db.query(
        'UPDATE bookings SET status = ?, cancelled_at = NOW() WHERE id = ?',
        ['CANCELLED', id]
      );
  
      const [updatedBookings] = await db.query(
        'SELECT * FROM bookings WHERE id = ?',
        [id]
      );
  
      res.json({
        success: true,
        message: 'Booking cancelled successfully',
        booking: updatedBookings[0]
      });
  
    } catch (error) {
      console.error('Cancel booking error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error. Please try again later.'
      });
    }
  };
  
  module.exports = {
    createBooking,
    getTravelerBookings,
    cancelBookingTraveler,
    getOwnerBookings,
    acceptBooking,
    cancelBookingOwner
  };
  