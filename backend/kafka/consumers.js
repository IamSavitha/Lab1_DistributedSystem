const { ownerConsumer, travelerConsumer, TOPICS } = require('../config/kafka');
const db = require('../config/database');

// Owner Consumer - Listens for booking requests
const startOwnerConsumer = async () => {
  try {
    await ownerConsumer.subscribe({
      topic: TOPICS.BOOKING_REQUEST,
      fromBeginning: false
    });

    await ownerConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const bookingData = JSON.parse(message.value.toString());
          console.log('📨 Owner service received booking request:', {
            bookingId: bookingData.id,
            propertyId: bookingData.propertyId,
            travelerId: bookingData.travelerId,
            status: bookingData.status
          });

          // Owner service can now see this booking in their dashboard
          // The booking is already in the database with PENDING status
          // Owner will accept/reject through the API endpoint

          // Optional: Send notification to owner (future enhancement)
          // notifyOwner(bookingData);

        } catch (error) {
          console.error('❌ Error processing booking request in owner consumer:', error);
        }
      }
    });

    console.log('✅ Owner consumer started - listening for booking requests');
  } catch (error) {
    console.error('❌ Failed to start owner consumer:', error);
    throw error;
  }
};

// Traveler Consumer - Listens for booking status updates
const startTravelerConsumer = async () => {
  try {
    await travelerConsumer.subscribe({
      topic: TOPICS.BOOKING_STATUS_UPDATE,
      fromBeginning: false
    });

    await travelerConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const bookingData = JSON.parse(message.value.toString());
          const status = message.headers['status']?.toString();

          console.log('📨 Traveler service received booking status update:', {
            bookingId: bookingData.id,
            status: status || bookingData.status,
            propertyName: bookingData.propertyName
          });

          // Traveler service can now see the updated status
          // The status is already updated in the database
          // This can be used for real-time notifications

          // Optional: Send notification to traveler (future enhancement)
          // notifyTraveler(bookingData);

          // Optional: Update cache or trigger real-time update to frontend
          // via WebSocket or SSE

        } catch (error) {
          console.error('❌ Error processing booking status update in traveler consumer:', error);
        }
      }
    });

    console.log('✅ Traveler consumer started - listening for booking status updates');
  } catch (error) {
    console.error('❌ Failed to start traveler consumer:', error);
    throw error;
  }
};

// Start all consumers
const startAllConsumers = async () => {
  try {
    await Promise.all([
      startOwnerConsumer(),
      startTravelerConsumer()
    ]);
    console.log('✅ All Kafka consumers started successfully');
  } catch (error) {
    console.error('❌ Failed to start consumers:', error);
    throw error;
  }
};

module.exports = {
  startOwnerConsumer,
  startTravelerConsumer,
  startAllConsumers
};
