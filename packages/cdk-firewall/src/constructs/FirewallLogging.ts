import { ArnFormat, Names, RemovalPolicy, Stack } from "aws-cdk-lib";
import { LogGroup, RetentionDays } from "aws-cdk-lib/aws-logs";
import { IBucket } from "aws-cdk-lib/aws-s3";
import { Construct, IConstruct } from "constructs";

export interface FirewallLogGroupProps {
  /**
   * How long the logs are retained. Logs contain the IP addresses of
   * visitors, which are personal data, so choose the shortest retention that
   * suits your needs.
   */
  readonly retention: RetentionDays;
}

/**
 * The result of binding a logging destination to a firewall.
 */
export interface FirewallLoggingConfig {
  /**
   * The ARN of the destination that WAF delivers the logs to.
   */
  readonly destinationArn: string;

  /**
   * The construct of the destination, which must exist before WAF starts
   * delivering logs to it.
   */
  readonly destination: IConstruct;
}

/**
 * Where a firewall delivers its logs.
 */
export abstract class FirewallLogging {
  /**
   * Delivers logs to an S3 bucket, which can be in any region of the same
   * account. Its name must start with `aws-waf-logs-` and its policy must
   * allow log delivery, which a `FirewallLogBucket` takes care of.
   */
  static toBucket(bucket: IBucket): FirewallLogging {
    return new BucketLogging(bucket);
  }

  /**
   * Delivers logs to a new CloudWatch log group. The log group is created in
   * the stack of the firewall, which is in `us-east-1`.
   */
  static toLogGroup(props: FirewallLogGroupProps): FirewallLogging {
    return new LogGroupLogging(props);
  }

  /**
   * Sets up the destination for the given firewall. Called by the firewall.
   */
  abstract bind(scope: Construct): FirewallLoggingConfig;
}

class BucketLogging extends FirewallLogging {
  constructor(private readonly bucket: IBucket) {
    super();
  }

  bind(): FirewallLoggingConfig {
    return {
      destinationArn: this.bucket.bucketArn,
      destination: this.bucket,
    };
  }
}

class LogGroupLogging extends FirewallLogging {
  constructor(private readonly props: FirewallLogGroupProps) {
    super();
  }

  bind(scope: Construct): FirewallLoggingConfig {
    /**
     * WAF requires the name of the log group to start with `aws-waf-logs-`.
     */
    const logGroupName = `aws-waf-logs-${Names.uniqueResourceName(scope, {
      maxLength: 256,
    })}`;

    const logGroup = new LogGroup(scope, "LogGroup", {
      logGroupName,
      retention: this.props.retention,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    return {
      /**
       * WAF requires the log group ARN without the `:*` suffix that the
       * `LogGroup.logGroupArn` attribute includes.
       */
      destinationArn: Stack.of(scope).formatArn({
        service: "logs",
        resource: "log-group",
        resourceName: logGroupName,
        arnFormat: ArnFormat.COLON_RESOURCE_NAME,
      }),
      destination: logGroup,
    };
  }
}
