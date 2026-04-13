import amqplib, { type ChannelModel, type Channel } from "amqplib";
import { EXCHANGE_NAME } from "./types";

let connection: ChannelModel;
let channel: Channel;

export async function connectRabbit(url?: string): Promise<Channel> {
  const rabbitmqUrl = url || "amqp://localhost";
  connection = await amqplib.connect(rabbitmqUrl);
  channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: true });

  return channel;
}

export function publish(routingKey: string, message: string): void {
  channel.publish(EXCHANGE_NAME, routingKey, Buffer.from(message), {
    persistent: true,
  });
}

export async function consume(
  queueName: string,
  routingKey: string,
  handler: (msg: string) => void,
): Promise<void> {
  await channel.assertQueue(queueName, { durable: true });
  await channel.bindQueue(queueName, EXCHANGE_NAME, routingKey);

  channel.consume(queueName, (msg: amqplib.ConsumeMessage | null) => {
    if (!msg) return;

    handler(msg.content.toString());
    channel.ack(msg);
  });
}

export async function disconnect(): Promise<void> {
  await channel?.close();
  await connection?.close();
}
