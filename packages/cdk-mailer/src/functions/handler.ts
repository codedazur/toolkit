import { SES } from "@aws-sdk/client-ses";
import { SQS, Message } from "@aws-sdk/client-sqs";
import { env } from "@codedazur/essentials";

const queueUrl = env.string("QUEUE_URL");
const perSecondRateLimit = env.int("PER_SECOND_RATE_LIMIT");
const fromAddress = env.string("FROM_ADDRESS");
const replyToAddresses = env.strings("REPLY_TO_ADDRESSES");

const sqs = new SQS({});
const ses = new SES({});

/**
 * This function is intended to be called by a scheduled lambda once per second
 * and will poll a configured number messages from SQS. This makes it possible
 * to reliably stay under a per-second rate limit.
 *
 * @see https://aws.amazon.com/blogs/messaging-and-targeting/prevent-email-throttling-concurrency-limit/
 */
export const handler = async () => {
  if (!queueUrl) {
    throw new Error("No QUEUE_URL configured.");
  }

  if (!perSecondRateLimit) {
    throw new Error("No PER_SECOND_RATE_LIMIT configured.");
  }

  let received = 0;

  while (received < perSecondRateLimit) {
    const response = await sqs.receiveMessage({
      QueueUrl: queueUrl,
      MaxNumberOfMessages: Math.min(perSecondRateLimit - received, 10),
    });

    console.log(`Received ${response.Messages?.length} messages.`);

    if (!response.Messages) {
      return;
    }

    received += response.Messages.length;

    await Promise.all(
      response.Messages.map(async (message) => {
        try {
          await handleMessage(message);

          await sqs.deleteMessage({
            QueueUrl: queueUrl,
            ReceiptHandle: message.ReceiptHandle!,
          });

          console.log(`Processed message: ${message.MessageId}.`);
        } catch (error) {
          console.error(
            `Failed to process message ${message.MessageId}:`,
            error,
          );
        }
      }),
    );
  }
};

export interface EmailMessage {
  recipient: string;
  subject: string;
  body: string;
}

async function handleMessage(message: Message) {
  if (!fromAddress) {
    throw new Error("No FROM_ADDRESS configured.");
  }

  const { recipient, subject, body }: EmailMessage = JSON.parse(
    message.Body ?? "",
  );

  if (!recipient || !subject || !body) {
    throw new Error(
      "The received message is missing some or all of the EmailMessage properties.",
    );
  }

  await ses.sendEmail({
    Source: fromAddress,
    ReplyToAddresses: replyToAddresses,
    Destination: {
      ToAddresses: [recipient],
    },
    Message: {
      Subject: { Charset: "UTF-8", Data: subject },
      Body: {
        Html: { Charset: "UTF-8", Data: body },
      },
    },
  });
}
