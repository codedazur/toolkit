import { Duration } from "aws-cdk-lib";
import { Rule, Schedule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import { Policy, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import path from "path";

interface MailerProps {
  readonly fromAddress: string;
  readonly replyToAddresses?: string[];
  readonly perSecondRateLimit: number;
}

/**
 * This construct queues requests to send emails and uses a "leaky bucket"
 * implementation to keep the flow rate of the emails under the configured
 * per-second rate limit. The handler will receive batches of 10 messages until
 * the per-second rate limit has been reached.
 */
export class Mailer extends Construct {
  public readonly queue: Queue;

  constructor(
    scope: Construct,
    id: string,
    protected props: MailerProps,
  ) {
    super(scope, id);

    this.queue = this.createQueue();
    const handler = this.createHandler();
    this.queue.grantConsumeMessages(handler);

    const schedule = this.createSchedule(handler);
    handler.grantInvoke(schedule);
  }

  protected createQueue() {
    const deadLetterQueue = new Queue(this, "DeadLetterQueue", {
      visibilityTimeout: Duration.seconds(120),
      retentionPeriod: Duration.days(14),
    });

    return new Queue(this, "Queue", {
      visibilityTimeout: Duration.seconds(300),
      deadLetterQueue: {
        maxReceiveCount: 3,
        queue: deadLetterQueue,
      },
    });
  }

  protected createHandler() {
    const handler = new NodejsFunction(this, "Handler", {
      entry: path.join(__dirname, "./functions/handler.ts"),
      timeout: Duration.minutes(1),
      memorySize: 128,
      environment: {
        QUEUE_URL: this.queue.queueUrl,
        PER_SECOND_RATE_LIMIT: this.props.perSecondRateLimit.toString(),
        FROM_ADDRESS: this.props.fromAddress,
        REPLY_TO_ADDRESSES: this.props.replyToAddresses?.join(",") ?? "",
      },
    });

    handler.role?.attachInlinePolicy(this.createHandlerPolicy());

    return handler;
  }

  protected createHandlerPolicy() {
    return new Policy(this, "HandlerPolicy", {
      statements: [
        new PolicyStatement({
          actions: ["ses:SendEmail"],
          resources: ["*"],
        }),
      ],
    });
  }

  protected createSchedule(handler: NodejsFunction) {
    const schedule = new NodejsFunction(this, "Schedule", {
      entry: path.join(__dirname, "./functions/schedule.ts"),
      timeout: Duration.minutes(2),
      memorySize: 128,
      environment: {
        HANDLER_ARN: handler.functionArn,
      },
      logRetention: RetentionDays.TWO_WEEKS,
    });

    const scheduleRule = new Rule(this, "ScheduleRule", {
      schedule: Schedule.rate(Duration.minutes(1)),
    });

    scheduleRule.addTarget(new LambdaFunction(schedule));

    return schedule;
  }
}
