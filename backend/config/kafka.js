const { Kafka } = require('kafkajs');

// Kafka configuration
const kafka = new Kafka({
  clientId: 'airbnb-app',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

// Topics
const TOPICS = {
  BOOKING_REQUEST: 'booking-request',
  BOOKING_STATUS_UPDATE: 'booking-status-update'
};

// Create producer
const producer = kafka.producer();

// Create consumers
const ownerConsumer = kafka.consumer({ groupId: 'owner-service' });
const travelerConsumer = kafka.consumer({ groupId: 'traveler-service' });

// Producer helper functions
const sendBookingRequest = async (bookingData) => {
  try {
    await producer.send({
      topic: TOPICS.BOOKING_REQUEST,
      messages: [
        {
          key: bookingData.id.toString(),
          value: JSON.stringify(bookingData),
          headers: {
            'event-type': 'BOOKING_CREATED'
          }
        }
      ]
    });
    console.log('✅ Booking request published to Kafka:', bookingData.id);
    return true;
  } catch (error) {
    console.error('❌ Failed to publish booking request:', error);
    throw error;
  }
};

const sendBookingStatusUpdate = async (bookingData) => {
  try {
    await producer.send({
      topic: TOPICS.BOOKING_STATUS_UPDATE,
      messages: [
        {
          key: bookingData.id.toString(),
          value: JSON.stringify(bookingData),
          headers: {
            'event-type': 'BOOKING_STATUS_CHANGED',
            'status': bookingData.status
          }
        }
      ]
    });
    console.log('✅ Booking status update published to Kafka:', bookingData.id, bookingData.status);
    return true;
  } catch (error) {
    console.error('❌ Failed to publish booking status update:', error);
    throw error;
  }
};

// Initialize producer
const initProducer = async () => {
  try {
    await producer.connect();
    console.log('✅ Kafka producer connected');
  } catch (error) {
    console.error('❌ Failed to connect Kafka producer:', error);
    throw error;
  }
};

// Initialize consumers
const initConsumers = async () => {
  try {
    await ownerConsumer.connect();
    await travelerConsumer.connect();
    console.log('✅ Kafka consumers connected');
  } catch (error) {
    console.error('❌ Failed to connect Kafka consumers:', error);
    throw error;
  }
};

// Graceful shutdown
const disconnectKafka = async () => {
  try {
    await producer.disconnect();
    await ownerConsumer.disconnect();
    await travelerConsumer.disconnect();
    console.log('✅ Kafka connections closed');
  } catch (error) {
    console.error('❌ Error disconnecting Kafka:', error);
  }
};

module.exports = {
  kafka,
  producer,
  ownerConsumer,
  travelerConsumer,
  TOPICS,
  sendBookingRequest,
  sendBookingStatusUpdate,
  initProducer,
  initConsumers,
  disconnectKafka
};
