import { Duration, Lazy, Names, Stack, Token } from "aws-cdk-lib";
import { PolicyStatement, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import {
  BlockPublicAccess,
  Bucket,
  BucketEncryption,
} from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export interface FirewallLogBucketProps {
  /**
   * How long logs are kept before they are deleted. Logs contain the IP
   * addresses of visitors, which are personal data, so choose the shortest
   * expiration that suits your needs.
   */
  readonly expiration: Duration;

  /**
   * The name of the bucket, which WAF requires to start with `aws-waf-logs-`.
   * Set it when a stack in another region needs to import the bucket by its
   * name, for example with `Bucket.fromBucketName()`.
   *
   * @default - `aws-waf-logs-` followed by the account, the region and a
   * unique ID.
   */
  readonly bucketName?: string;
}

const BUCKET_NAME_PREFIX = "aws-waf-logs-";

/**
 * An S3 bucket that firewalls can deliver their logs to. Unlike a CloudWatch
 * log group, which must be in the region of the firewall, this bucket can be
 * in any region of the same account, for example to keep logs in the EU.
 *
 * The bucket is not deleted along with its stack, but its logs still expire.
 */
export class FirewallLogBucket extends Bucket {
  constructor(scope: Construct, id: string, props: FirewallLogBucketProps) {
    super(scope, id, {
      /**
       * The account and region make the default name globally unique.
       */
      bucketName: props.bucketName
        ? validateBucketName(props.bucketName)
        : Lazy.string({
            produce: () =>
              BUCKET_NAME_PREFIX +
              [
                Stack.of(this).account,
                Stack.of(this).region,
                Names.uniqueResourceName(this, { maxLength: 16 }).toLowerCase(),
              ].join("-"),
          }),
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      lifecycleRules: [{ expiration: props.expiration }],
    });

    this.allowWafLogDelivery();
  }

  /**
   * WAF adds these statements to the bucket policy itself if they are
   * missing, but CloudFormation would remove them again when it updates the
   * bucket policy, so they are defined explicitly.
   * @see https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AWS-logs-and-resource-policy.html#AWS-logs-infrastructure-S3
   */
  protected allowWafLogDelivery() {
    const { account } = Stack.of(this);
    const principal = new ServicePrincipal("delivery.logs.amazonaws.com");
    const conditions = {
      StringEquals: { "aws:SourceAccount": account },
      ArnLike: { "aws:SourceArn": `arn:aws:logs:*:${account}:*` },
    };

    this.addToResourcePolicy(
      new PolicyStatement({
        sid: "AWSLogDeliveryWrite",
        principals: [principal],
        actions: ["s3:PutObject"],
        resources: [this.arnForObjects(`AWSLogs/${account}/*`)],
        conditions: {
          ...conditions,
          StringEquals: {
            ...conditions.StringEquals,
            "s3:x-amz-acl": "bucket-owner-full-control",
          },
        },
      }),
    );

    this.addToResourcePolicy(
      new PolicyStatement({
        sid: "AWSLogDeliveryAclCheck",
        principals: [principal],
        actions: ["s3:GetBucketAcl", "s3:ListBucket"],
        resources: [this.bucketArn],
        conditions,
      }),
    );
  }
}

/**
 * Throws if the name doesn't start with `aws-waf-logs-`, because WAF would
 * only reject the bucket at deploy time. A token can't be checked until then.
 */
function validateBucketName(bucketName: string): string {
  if (
    !Token.isUnresolved(bucketName) &&
    !bucketName.startsWith(BUCKET_NAME_PREFIX)
  ) {
    throw new Error(
      `The name of a firewall log bucket must start with "${BUCKET_NAME_PREFIX}", but got "${bucketName}".`,
    );
  }

  return bucketName;
}
