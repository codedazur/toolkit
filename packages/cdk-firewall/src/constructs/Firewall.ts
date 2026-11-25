import { Duration, Names, Stack, Token } from "aws-cdk-lib";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { CfnLoggingConfiguration, CfnWebACL } from "aws-cdk-lib/aws-wafv2";
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  PhysicalResourceId,
} from "aws-cdk-lib/custom-resources";
import { Construct, IConstruct } from "constructs";
import { FirewallLogging } from "./FirewallLogging";

/**
 * Whether matching rules block requests or only count them. Counting is
 * useful to evaluate the effect of the firewall before enforcing it, by
 * inspecting the logs and metrics for requests that would have been blocked.
 */
export enum FirewallMode {
  /**
   * Matching rules block requests.
   */
  BLOCK = "BLOCK",

  /**
   * Matching rules only count requests.
   */
  COUNT = "COUNT",
}

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

/**
 * How a masked field is stored in sampled requests and logs.
 */
export enum MaskingAction {
  /**
   * Replaces the value with `REDACTED`.
   */
  SUBSTITUTION = "SUBSTITUTION",

  /**
   * Replaces the value with a hash, so you can still tell whether requests
   * contain the same value, for example the same session cookie.
   */
  HASH = "HASH",

  /**
   * Does not mask the field. Use this to stop masking one of the defaults.
   */
  NONE = "NONE",
}

/**
 * Fields of the request to mask. These are merged with the defaults, so you
 * only need to specify the fields you want to add or change. Set a field to
 * `MaskingAction.NONE` to stop masking it.
 */
export interface FirewallMaskingProps {
  /**
   * Headers by name. Names are case-insensitive.
   */
  readonly headers?: Record<string, MaskingAction>;

  /**
   * Cookies by name.
   */
  readonly cookies?: Record<string, MaskingAction>;

  /**
   * Query parameters by name. To mask all query parameters, use
   * `queryString` instead.
   */
  readonly queryParameters?: Record<string, MaskingAction>;

  /**
   * The entire query string, which includes all query parameters.
   */
  readonly queryString?: MaskingAction;

  /**
   * The request body.
   */
  readonly body?: MaskingAction;
}

export interface FirewallProps {
  /**
   * Whether matching rules block requests or only count them.
   * @default FirewallMode.BLOCK
   */
  readonly mode?: FirewallMode;

  /**
   * Custom rules, evaluated before the rate limit and managed rule groups.
   * @default []
   */
  readonly rules?: FirewallRule[];

  /**
   * Rate limiting per IP address. Visitors behind a shared IP address, such
   * as an office or campus network, count towards the same limit, so choose a
   * limit that accommodates them.
   * @default - No rate limit.
   */
  readonly rateLimit?: RateLimitProps;

  /**
   * The managed rule groups to apply, in order of evaluation.
   * @default Firewall.defaultManagedRuleGroups
   */
  readonly managedRuleGroups?: ManagedRuleGroupProps[];

  /**
   * Fields of the request that are masked in the request data that WAF
   * stores, which includes sampled requests and logs. Use this to mask other
   * fields that contain personal data or secrets. These are merged with
   * `Firewall.defaultMasking`, which masks the `authorization` and `cookie`
   * headers.
   * @see https://docs.aws.amazon.com/waf/latest/developerguide/data-protection-masking.html
   */
  readonly masking?: FirewallMaskingProps;

  /**
   * Logging of blocked and counted requests, for example with
   * `FirewallLogging.toBucket()` or `FirewallLogging.toLogGroup()`. Allowed
   * requests are not logged, to limit cost. The logs contain the IP addresses
   * of visitors, which WAF can not mask.
   * @default - No logging.
   */
  readonly logging?: FirewallLogging;
}

/**
 * A WAF web ACL for CloudFront distributions.
 */
export interface IFirewall extends IConstruct {
  /**
   * The ARN of the web ACL.
   */
  readonly webAclArn: string;

  /**
   * Returns the firewall for use in the stack of the given scope, which may be
   * in another region than the firewall. If it is in the same region, this
   * returns the firewall itself.
   */
  importInto(scope: Construct): IFirewall;
}

/**
 * A WAF web ACL for use with a CloudFront distribution.
 *
 * Web ACLs for CloudFront must be created in `us-east-1`, so the stack that
 * contains this construct must be deployed to that region. If your application
 * is deployed to another region, create the firewall in a separate `us-east-1`
 * stack and pass it to the stack of your application. A `SiteDistribution`
 * imports it into its own region with `importInto`.
 *
 * By default, it applies the following AWS managed rule groups:
 * - `AWSManagedRulesAmazonIpReputationList` blocks IP addresses that are known
 *   to be associated with bots and other threats.
 * - `AWSManagedRulesCommonRuleSet` blocks common exploits such as cross-site
 *   scripting, path traversal and server-side request forgery. Its
 *   `SizeRestrictions_BODY` rule, which blocks request bodies over 8 KB, is
 *   set to count, because it breaks most uploads and larger form submissions.
 * - `AWSManagedRulesKnownBadInputsRuleSet` blocks request patterns that are
 *   known to exploit specific vulnerabilities.
 * - `AWSManagedRulesLinuxRuleSet` blocks attempts to access Linux system
 *   files, such as `/etc/passwd`.
 * - `AWSManagedRulesUnixRuleSet` blocks command injection on POSIX operating
 *   systems.
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

  static readonly defaultManagedRuleGroups: ManagedRuleGroupProps[] = [
    { name: "AWSManagedRulesAmazonIpReputationList" },
    {
      name: "AWSManagedRulesCommonRuleSet",
      countRules: ["SizeRestrictions_BODY"],
    },
    { name: "AWSManagedRulesKnownBadInputsRuleSet" },
    { name: "AWSManagedRulesLinuxRuleSet" },
    { name: "AWSManagedRulesUnixRuleSet" },
  ];

  /**
   * Masks the `authorization` and `cookie` headers, which typically contain
   * session tokens.
   */
  static readonly defaultMasking: FirewallMaskingProps = {
    headers: {
      authorization: MaskingAction.SUBSTITUTION,
      cookie: MaskingAction.SUBSTITUTION,
    },
  };

  public readonly webAcl: CfnWebACL;
  public readonly loggingConfiguration?: CfnLoggingConfiguration;

  constructor(
    scope: Construct,
    id: string,
    protected readonly props: FirewallProps = {},
  ) {
    super(scope, id);

    this.webAcl = this.createWebAcl();
    this.loggingConfiguration = this.createLogging();
  }

  public get webAclArn(): string {
    return this.webAcl.attrArn;
  }

  /**
   * Returns the firewall for use in the stack of the given scope. If that
   * stack is in another region, it reads the ARN of the web ACL from an SSM
   * parameter next to the firewall, with a custom resource in the stack of the
   * given scope. That stack then depends on the stack of the firewall.
   *
   * Unlike `crossRegionReferences`, this doesn't deploy Lambda functions in
   * `us-east-1`, which some organizations' policies don't allow.
   */
  public importInto(scope: Construct): IFirewall {
    const stack = Stack.of(scope);
    const firewallStack = Stack.of(this);

    if (
      Token.isUnresolved(stack.region) ||
      Token.isUnresolved(firewallStack.region) ||
      stack.region === firewallStack.region
    ) {
      return this;
    }

    const id = `${Names.uniqueId(this)}Import`;
    const existing = stack.node.tryFindChild(id);

    if (existing) {
      return (existing as Construct).node.findChild("Firewall") as IFirewall;
    }

    stack.addDependency(firewallStack);

    // The import belongs to the importing stack, once per firewall.
    const container = new Construct(stack, id);
    this.createWebAclArnParameter();

    /**
     * The name is used as a plain string rather than through the parameter,
     * whose name is a token that can't be sliced for the ARN.
     */
    const parameterName = this.webAclArnParameterName;

    const webAclArn = new AwsCustomResource(container, "WebAclArn", {
      onUpdate: {
        service: "SSM",
        action: "getParameter",
        parameters: { Name: parameterName },
        region: firewallStack.region,
        /**
         * A new ID on every deploy makes CloudFormation read the parameter
         * again, so the stack picks up a new ARN if the web ACL is replaced.
         */
        physicalResourceId: PhysicalResourceId.of(Date.now().toString()),
      },
      installLatestAwsSdk: false,
      policy: AwsCustomResourcePolicy.fromSdkCalls({
        resources: [
          firewallStack.formatArn({
            service: "ssm",
            resource: "parameter",
            resourceName: parameterName.slice(1),
          }),
        ],
      }),
    }).getResponseField("Parameter.Value");

    return Firewall.fromWebAclArn(container, "Firewall", webAclArn);
  }

  /**
   * The name of the SSM parameter that other regions read the ARN of the web
   * ACL from.
   */
  protected get webAclArnParameterName(): string {
    return `/cdk-firewall/${Names.uniqueId(this)}/web-acl-arn`;
  }

  /**
   * Creates the SSM parameter that other regions read the ARN of the web ACL
   * from, once a stack in another region imports the firewall.
   */
  protected createWebAclArnParameter(): void {
    if (this.node.tryFindChild("WebAclArnParameter")) {
      return;
    }

    new StringParameter(this, "WebAclArnParameter", {
      parameterName: this.webAclArnParameterName,
      stringValue: this.webAclArn,
    });
  }

  protected get mode(): FirewallMode {
    return this.props.mode ?? FirewallMode.BLOCK;
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
    const defaults = Firewall.defaultMasking;
    const masking = this.props.masking ?? {};

    const dataProtections = [
      ...this.createKeyedDataProtections("SINGLE_HEADER", {
        ...lowerCaseKeys(defaults.headers),
        ...lowerCaseKeys(masking.headers),
      }),
      ...this.createKeyedDataProtections("SINGLE_COOKIE", {
        ...defaults.cookies,
        ...masking.cookies,
      }),
      ...this.createKeyedDataProtections("SINGLE_QUERY_ARGUMENT", {
        ...defaults.queryParameters,
        ...masking.queryParameters,
      }),
      ...this.createDataProtection(
        "QUERY_STRING",
        masking.queryString ?? defaults.queryString,
      ),
      ...this.createDataProtection("BODY", masking.body ?? defaults.body),
    ];

    return dataProtections.length > 0 ? { dataProtections } : undefined;
  }

  /**
   * Creates one data protection per action, for the fields that use it.
   */
  protected createKeyedDataProtections(
    fieldType: string,
    fields: Record<string, MaskingAction>,
  ): CfnWebACL.DataProtectProperty[] {
    const actions = Object.values(MaskingAction).filter(
      (action) => action !== MaskingAction.NONE,
    );

    return actions.flatMap((action) => {
      const fieldKeys = Object.keys(fields).filter(
        (key) => fields[key] === action,
      );

      return fieldKeys.length > 0
        ? [{ field: { fieldType, fieldKeys }, action }]
        : [];
    });
  }

  protected createDataProtection(
    fieldType: string,
    action: MaskingAction | undefined,
  ): CfnWebACL.DataProtectProperty[] {
    return action && action !== MaskingAction.NONE
      ? [{ field: { fieldType }, action }]
      : [];
  }

  protected createRules(): FirewallRule[] {
    const rateLimit = this.props.rateLimit;

    return [
      ...(this.props.rules ?? []),
      ...(rateLimit ? [this.createRateLimitRule(rateLimit)] : []),
      ...(
        this.props.managedRuleGroups ?? Firewall.defaultManagedRuleGroups
      ).map((group) => this.createManagedRuleGroupRule(group)),
    ].map((rule) =>
      this.mode === FirewallMode.COUNT ? this.toCountRule(rule) : rule,
    );
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
    if (!this.props.logging) {
      return;
    }

    const { destinationArn, destination } = this.props.logging.bind(this);

    return this.createLoggingConfiguration(destinationArn, destination);
  }

  protected createLoggingConfiguration(
    destinationArn: string,
    destination: IConstruct,
  ) {
    const configuration = new CfnLoggingConfiguration(
      this,
      "LoggingConfiguration",
      {
        resourceArn: this.webAcl.attrArn,
        logDestinationConfigs: [destinationArn],
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

    /**
     * Ensures that the destination, including the policy of a bucket, exists
     * before WAF starts delivering logs to it.
     */
    configuration.node.addDependency(destination);

    return configuration;
  }
}

function lowerCaseKeys<T>(record: Record<string, T> = {}): Record<string, T> {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [key.toLowerCase(), value]),
  );
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

  /**
   * The ARN is known, so the firewall can be used in any region as is.
   */
  public importInto(): IFirewall {
    return this;
  }
}
