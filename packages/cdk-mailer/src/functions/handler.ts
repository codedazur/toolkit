import { SES } from "@aws-sdk/client-ses";
import { Message, SQS } from "@aws-sdk/client-sqs";
import { env } from "@codedazur/essentials";
import { EmailMessage } from "../types/EmailMessage";
import { maskEmail } from "../utilities/maskEmail";

const QUEUE_URL = env.string("QUEUE_URL");
const PER_SECOND_RATE_LIMIT = env.int("PER_SECOND_RATE_LIMIT");
const FROM_ADDRESS = env.string("FROM_ADDRESS");
const REPLY_TO_ADDRESSES = env.strings("REPLY_TO_ADDRESSES");

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
  if (!QUEUE_URL) {
    throw new Error("No QUEUE_URL configured.");
  }

  if (!PER_SECOND_RATE_LIMIT) {
    throw new Error("No PER_SECOND_RATE_LIMIT configured.");
  }

  let received = 0;

  while (received < PER_SECOND_RATE_LIMIT) {
    const response = await sqs.receiveMessage({
      QueueUrl: QUEUE_URL,
      MaxNumberOfMessages: Math.min(PER_SECOND_RATE_LIMIT - received, 10),
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
            QueueUrl: QUEUE_URL,
            ReceiptHandle: message.ReceiptHandle!,
          });
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

async function handleMessage(message: Message) {
  if (!FROM_ADDRESS) {
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
    Source: FROM_ADDRESS,
    ReplyToAddresses: REPLY_TO_ADDRESSES,
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

  console.log(`Sent email to ${maskEmail(recipient)}.`);
}
