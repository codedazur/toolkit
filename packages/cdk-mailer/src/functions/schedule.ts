import { Lambda } from "@aws-sdk/client-lambda";
import { env } from "@codedazur/essentials";

const handlerArn = env.string("HANDLER_ARN");

const lambda = new Lambda({});

/**
 * This function should be scheduled to run once per minute, and will call the
 * configured Lambda function once per second.
 *
 * @see https://aws.amazon.com/blogs/messaging-and-targeting/prevent-email-throttling-concurrency-limit/
 */
export const handler = async () => {
  if (!handlerArn) {
    throw new Error("No HANDLER_ARN configured.");
  }

  for (let i = 0; i < 60; i++) {
    const time = Date.now();

    await lambda.invoke({
      FunctionName: handlerArn,
      InvocationType: "Event",
    });

    const deltaTime = Date.now() - time;

    if (i < 59 && deltaTime < 1000) {
      await sleep(1000 - deltaTime);
    }
  }
};

function sleep(duration: number) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}
