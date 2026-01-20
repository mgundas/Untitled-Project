import { kafka } from '../lib/kafka';
import { z } from 'zod';

// 1. Define a Schema for your events
// This ensures that even if JSON is valid, the data inside is what we expect
const SocialEventSchema = z.object({
  type: z.enum(['LIKE', 'RETWEET', 'COMMENT']),
  postId: z.string(),
  userId: z.string().optional(), // Optional if not always provided
});

const consumer = kafka.consumer({
  groupId: 'social-counts-v2',
  sessionTimeout: 30000,
  heartbeatInterval: 10000,
  rebalanceTimeout: 60000
});

const producer = kafka.producer(); // Producer to send messages to the DLQ

async function main() {
  console.log('Connecting to Kafka...');
  await consumer.connect();
  await producer.connect();

  let subscribed = false;
  while (!subscribed) {
    try {
      await consumer.subscribe({ topic: 'social-counts-v2', fromBeginning: true });
      subscribed = true;
    } catch (e) {
      console.error('Coordinator not ready yet, retrying in 5s...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  console.log('🚀 Worker is listening for Kafka events...');

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const rawValue = message.value?.toString();
      
      try {
        // A. JSON Parsing & Validation
        const json = JSON.parse(rawValue || '{}');
        const data = SocialEventSchema.parse(json); // Throws error if schema doesn't match

        // B. Database Logic (Idempotent)
        // You would typically wrap this in a DB transaction
        console.log(`✅ Success: Processed ${data.type} for Post ${data.postId}`);

      } catch (err) {
        // C. Dead Letter Queue (DLQ) Logic
        // If it's bad JSON, wrong schema, or DB failure, move it to DLQ
        console.error(`❌ Error at offset ${message.offset}. Sending to DLQ...`);
        
        await producer.send({
          topic: 'social-counts-dlq',
          messages: [{
            key: message.key,
            value: JSON.stringify({
              error: err instanceof Error ? err.message : 'Unknown error',
              originalMessage: rawValue,
              timestamp: new Date().toISOString()
            })
          }]
        });
      }
    },
  });
}

// 3. Graceful Shutdown Logic
// This tells Kafka "I'm leaving" so it can rebalance the group immediately
const shutdown = async () => {
  console.log('\nStopping worker...');
  await consumer.disconnect();
  await producer.disconnect();
  process.exit(0);
};

process.on('SIGINT', shutdown);  // Ctrl+C
process.on('SIGTERM', shutdown); // Docker stop

main().catch(console.error);