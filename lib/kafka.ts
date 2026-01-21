import { Kafka, Producer } from 'kafkajs';

const globalForKafka = global as unknown as { kafkaProducer: Producer };

export const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['10.15.20.102:9092'],
  retry: {
    initialRetryTime: 100,
    retries: 8 // Give it more tries to find the coordinator on startup
  }
});

// We export a function to get the producer so it stays connected
export const getProducer = async () => {
  if (!globalForKafka.kafkaProducer) {
    globalForKafka.kafkaProducer = kafka.producer();
    await globalForKafka.kafkaProducer.connect();
  }
  return globalForKafka.kafkaProducer;
};