import {
  ArnFormat,
  Duration,
  Names,
  RemovalPolicy,
  Stack,
  Token,
} from "aws-cdk-lib";
import { ILogGroup, LogGroup, RetentionDays } from "aws-cdk-lib/aws-logs";
import { CfnLoggingConfiguration, CfnWebACL } from "aws-cdk-lib/aws-wafv2";
import { Construct, IConstruct } from "constructs";

/**
 * Whether matching rules block requests or only count them. Counting is
 * useful to evaluate the effect of the firewall before enforcing it, by
 * inspecting the logs and metrics for requests that would have been blocked.
 */
export type FirewallMode = "block" | "count";

export interface ManagedRuleGroupProps {
  /**
   * The name of the managed rule group, e.g. `AWSManagedRulesCommonRuleSet`.
   * @see https://docs.aws.amazon.com/waf/latest/developerguide/aws-managed-rule-groups-list.html
   */
  readonly name: string;

  /**
   * The vendor of the managed rule group.
   * @default "AWS"
   */
  readonly vendor?: string;

  /**
   * A specific version of the managed rule group. When omitted, the default
   * version is used, which AWS updates automatically.
   */
  readonly version?: string;

  /**
   * Names of rules within the group whose action is overridden to count. Use
   * this for rules that cause false positives. Matches are still logged, but
   * requests will not be blocked.
   */
  readonly countRules?: string[];
}

export interface RateLimitProps {
  /**
   * The maximum number of requests a single IP address may make within the
   * evaluation window. Note that CloudFront evaluates the firewall before its
   * cache, so cached responses count towards this limit as well.
   */
  readonly limit: number;

  /**
   * The evaluation window. Must be 1, 2, 5 or 10 minutes.
   * @default Duration.minutes(5)
   */
  readonly window?: Duration;

  /**
   * Path prefixes that do not count towards the limit, such as static assets
   * that are requested in large numbers by every page view.
   * @default []
   */
  readonly excludePaths?: string[];
}

/**
 * A custom web ACL rule. Priorities are assigned automatically based on the
 * order of the rules, and a visibility configuration is generated if omitted.
 */
export type FirewallRule = Omit<
  CfnWebACL.RuleProperty,
  "priority" | "visibilityConfig"
> & {
  readonly visibilityConfig?: CfnWebACL.VisibilityConfigProperty;
};

export interface FirewallLoggingProps {
  /**
   * How long the firewall logs are retained. Logs contain the IP addresses of
   * visitors, which are personal data, so choose the shortest retention that
   * suits your needs.
   */
  readonly retention: RetentionDays;
}

export interface FirewallProps {
  /**
   * Whether matching rules block requests or only count them.
   * @default "block"
   */
  readonly mode?: FirewallMode;

  /**
   * Custom rules, evaluated before the rate limit and managed rule groups.
   * @default []
   */
  readonly rules?: FirewallRule[];

  /**
   * Rate limiting per IP address. Set to `false` to disable.
   * @default { limit: 3000, window: Duration.minutes(5) }
   */
  readonly rateLimit?: RateLimitProps | false;

  /**
   * The managed rule groups to apply, in order of evaluation.
   * @default Firewall.defaultManagedRuleGroups
   */
  readonly managedRuleGroups?: ManagedRuleGroupProps[];

  /**
   * Fields of the request that are masked in the request data that WAF
   * stores, which includes sampled requests and logs. Use this to mask other
   * headers, cookies, query parameters or the body, if they contain personal
   * data or secrets. To keep the defaults, include
   * `...Firewall.defaultDataProtections`.
   * @default Firewall.defaultDataProtections
   * @see https://docs.aws.amazon.com/waf/latest/developerguide/data-protection-masking.html
   */
  readonly dataProtections?: CfnWebACL.DataProtectProperty[];

  /**
   * Logging of blocked and counted requests to CloudWatch Logs. Allowed
   * requests are not logged, to limit cost. The logs contain the IP addresses
   * of visitors, which WAF can not mask.
   * @default - No logging.
   */
  readonly logging?: FirewallLoggingProps;
}

/**
 * A WAF web ACL for CloudFront distributions.
 */
export interface IFirewall extends IConstruct {
  /**
   * The ARN of the web ACL.
   */
  readonly webAclArn: string;
}

/**
 * A WAF web ACL for use with a CloudFront distribution.
 *
 * Web ACLs for CloudFront must be created in `us-east-1`, so the stack that
 * contains this construct must be deployed to that region. If your application
 * is deployed to another region, create the firewall in a separate `us-east-1`
 * stack and pass it to the stack of your application. Both stacks need
 * `crossRegionReferences: true`.
 *
 * By default, it applies a rate limit per IP address and the following AWS
 * managed rule groups:
 * - `AWSManagedRulesAmazonIpReputationList` blocks IP addresses that are known
 *   to be associated with bots and other threats.
 * - `AWSManagedRulesCommonRuleSet` blocks common exploits such as cross-site
 *   scripting, path traversal and server-side request forgery. Its
 *   `SizeRestrictions_BODY` rule, which blocks request bodies over 8 KB, is
 *   set to count, because it breaks most uploads and larger form submissions.
 * - `AWSManagedRulesKnownBadInputsRuleSet` blocks request patterns that are
 *   known to exploit specific vulnerabilities.
 *
 * By default, the `authorization` and `cookie` headers are masked in the
 * request data that WAF stores, which includes sampled requests and logs,
 * because they typically contain session tokens.
 */
export class Firewall extends Construct implements IFirewall {
  static readonly region = "us-east-1";

  /**
   * Imports an existing web ACL, for example one that was created outside of
   * CDK, by its ARN.
   */
  static fromWebAclArn(
    scope: Construct,
    id: string,
    webAclArn: string,
  ): IFirewall {
    // Static import methods create the construct in the caller's scope.
    // eslint-disable-next-line awscdk/require-passing-this
    return new ImportedFirewall(scope, id, { webAclArn });
  }

  static readonly defaultRateLimit: RateLimitProps = {
    limit: 3000,
    window: Duration.minutes(5),
  };

  static readonly defaultManagedRuleGroups: ManagedRuleGroupProps[] = [
    { name: "AWSManagedRulesAmazonIpReputationList" },
    {
      name: "AWSManagedRulesCommonRuleSet",
      countRules: ["SizeRestrictions_BODY"],
    },
    { name: "AWSManagedRulesKnownBadInputsRuleSet" },
  ];

  /**
   * Masks the `authorization` and `cookie` headers, which typically contain
   * session tokens.
   */
  static readonly defaultDataProtections: CfnWebACL.DataProtectProperty[] = [
    {
      field: {
        fieldType: "SINGLE_HEADER",
        fieldKeys: ["authorization", "cookie"],
      },
      action: "SUBSTITUTION",
    },
  ];

  public readonly webAcl: CfnWebACL;
  public readonly logGroup?: ILogGroup;

  constructor(
    scope: Construct,
    id: string,
    protected readonly props: FirewallProps = {},
  ) {
    super(scope, id);

    this.assertRegion();

    this.webAcl = this.createWebAcl();
    this.logGroup = this.createLogging();
  }

  public get webAclArn(): string {
    return this.webAcl.attrArn;
  }

  protected get mode(): FirewallMode {
    return this.props.mode ?? "block";
  }

  protected assertRegion() {
    const region = Stack.of(this).region;

    if (!Token.isUnresolved(region) && region !== Firewall.region) {
      throw new Error(
        `A firewall for a CloudFront distribution must be created in ${Firewall.region}, but this stack is in ${region}. Create the firewall in a separate ${Firewall.region} stack instead, and enable \`crossRegionReferences\` on both stacks.`,
      );
    }
  }

  protected createWebAcl() {
    const name = Names.uniqueResourceName(this, { maxLength: 128 });

    return new CfnWebACL(this, "WebAcl", {
      scope: "CLOUDFRONT",
      defaultAction: { allow: {} },
      visibilityConfig: this.visibilityConfig(name),
      dataProtectionConfig: this.createDataProtectionConfig(),
      rules: this.createRules().map((rule, priority) => ({
        ...rule,
        priority,
        visibilityConfig:
          rule.visibilityConfig ?? this.visibilityConfig(rule.name),
      })),
    });
  }

  protected createDataProtectionConfig():
    CfnWebACL.DataProtectionConfigProperty | undefined {
    const dataProtections =
      this.props.dataProtections ?? Firewall.defaultDataProtections;

    return dataProtections.length > 0 ? { dataProtections } : undefined;
  }

  protected createRules(): FirewallRule[] {
    const rateLimit = this.props.rateLimit ?? Firewall.defaultRateLimit;

    return [
      ...(this.props.rules ?? []),
      ...(rateLimit ? [this.createRateLimitRule(rateLimit)] : []),
      ...(
        this.props.managedRuleGroups ?? Firewall.defaultManagedRuleGroups
      ).map((group) => this.createManagedRuleGroupRule(group)),
    ].map((rule) => (this.mode === "count" ? this.toCountRule(rule) : rule));
  }

  protected createRateLimitRule({
    limit,
    window = Duration.minutes(5),
    excludePaths = [],
  }: RateLimitProps): FirewallRule {
    return {
      name: "RateLimit",
      action: { block: {} },
      statement: {
        rateBasedStatement: {
          limit,
          evaluationWindowSec: window.toSeconds(),
          aggregateKeyType: "IP",
          scopeDownStatement: this.createExcludePathsStatement(excludePaths),
        },
      },
    };
  }

  protected createExcludePathsStatement(
    paths: string[],
  ): CfnWebACL.StatementProperty | undefined {
    const statements = paths.map((path): CfnWebACL.StatementProperty => ({
      byteMatchStatement: {
        fieldToMatch: { uriPath: {} },
        positionalConstraint: "STARTS_WITH",
        searchString: path,
        textTransformations: [{ priority: 0, type: "NONE" }],
      },
    }));

    if (statements.length === 0) {
      return undefined;
    }

    return {
      notStatement: {
        statement:
          statements.length === 1
            ? statements[0]
            : { orStatement: { statements } },
      },
    };
  }

  protected createManagedRuleGroupRule({
    name,
    vendor = "AWS",
    version,
    countRules = [],
  }: ManagedRuleGroupProps): FirewallRule {
    return {
      name: `${vendor}-${name}`,
      overrideAction: { none: {} },
      statement: {
        managedRuleGroupStatement: {
          vendorName: vendor,
          name,
          version,
          ruleActionOverrides:
            countRules.length > 0
              ? countRules.map((rule) => ({
                  name: rule,
                  actionToUse: { count: {} },
                }))
              : undefined,
        },
      },
    };
  }

  /**
   * Overrides the action of a rule to count instead of its configured action.
   */
  protected toCountRule(rule: FirewallRule): FirewallRule {
    return {
      ...rule,
      action: rule.action ? { count: {} } : undefined,
      overrideAction: rule.overrideAction ? { count: {} } : undefined,
    };
  }

  protected visibilityConfig(
    metricName: string,
  ): CfnWebACL.VisibilityConfigProperty {
    return {
      cloudWatchMetricsEnabled: true,
      sampledRequestsEnabled: true,
      metricName: metricName.replace(/[^\w-]/g, "_"),
    };
  }

  protected createLogging() {
    const logging = this.props.logging;

    if (!logging) {
      return;
    }

    const { retention } = logging;

    const logGroupName = `aws-waf-logs-${Names.uniqueResourceName(this, {
      maxLength: 256,
    })}`;

    const logGroup = new LogGroup(this, "LogGroup", {
      logGroupName,
      retention,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const configuration = new CfnLoggingConfiguration(
      this,
      "LoggingConfiguration",
      {
        resourceArn: this.webAcl.attrArn,
        /**
         * WAF requires the log group ARN without the `:*` suffix that the
         * `LogGroup.logGroupArn` attribute includes.
         */
        logDestinationConfigs: [
          Stack.of(this).formatArn({
            service: "logs",
            resource: "log-group",
            resourceName: logGroupName,
            arnFormat: ArnFormat.COLON_RESOURCE_NAME,
          }),
        ],
        loggingFilter: {
          DefaultBehavior: "DROP",
          Filters: [
            {
              Behavior: "KEEP",
              Requirement: "MEETS_ANY",
              Conditions: ["BLOCK", "COUNT", "EXCLUDED_AS_COUNT"].map(
                (action) => ({ ActionCondition: { Action: action } }),
              ),
            },
          ],
        },
      },
    );

    configuration.node.addDependency(logGroup);

    return logGroup;
  }
}

/**
 * A firewall that was created elsewhere, imported by its ARN.
 */
class ImportedFirewall extends Construct implements IFirewall {
  public readonly webAclArn: string;

  constructor(scope: Construct, id: string, props: { webAclArn: string }) {
    super(scope, id);

    this.webAclArn = props.webAclArn;
  }
}
