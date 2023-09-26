import { Aws, Duration } from "aws-cdk-lib";
import { IDistribution } from "aws-cdk-lib/aws-cloudfront";
import { Rule, RuleTargetInput } from "aws-cdk-lib/aws-events";
import { SfnStateMachine } from "aws-cdk-lib/aws-events-targets";
import { JsonPath, StateMachine } from "aws-cdk-lib/aws-stepfunctions";
import { CallAwsService } from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";

interface CacheInvalidatorProps {
  distribution: IDistribution;
  paths: string[];
}

/**
 * This construct triggers a step function that invalidates the provided cache
 * when the stack containing this construct is done updating. This construct
 * does not cause the deployment to wait for the invalidation to complete.
 */
export class CacheInvalidator extends Construct {
  constructor(
    scope: Construct,
    id: string,
    { distribution, paths = ["/*"] }: CacheInvalidatorProps
  ) {
    super(scope, id);

    const action = new CallAwsService(this, "Action", {
      service: "cloudfront",
      action: "createInvalidation",
      parameters: {
        DistributionId: distribution.distributionId,
        InvalidationBatch: {
          CallerReference: JsonPath.entirePayload,
          Paths: {
            Items: paths,
            Quantity: 1,
          },
        },
      },
      iamResources: [
        `arn:aws:cloudfront::${Aws.ACCOUNT_ID}:distribution/${distribution.distributionId}`,
      ],
    });

    const stateMachine = new StateMachine(this, "StateMachine", {
      definition: action.addRetry({
        errors: ["CloudFront.CloudFrontException"],
        backoffRate: 2,
        interval: Duration.seconds(5),
        maxAttempts: 10,
      }),
    });

    new Rule(this, "Rule", {
      eventPattern: {
        source: ["aws.cloudformation"],
        detail: {
          "stack-id": [Aws.STACK_ID],
          "status-details": {
            status: ["UPDATE_COMPLETE"],
          },
        },
      },
    }).addTarget(
      new SfnStateMachine(stateMachine, {
        input: RuleTargetInput.fromEventPath("$.id"),
      })
    );
  }
}
