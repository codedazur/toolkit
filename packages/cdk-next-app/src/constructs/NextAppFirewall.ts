import {
  Firewall,
  FirewallProps,
  FirewallRule,
  RateLimitProps,
} from "@codedazur/cdk-firewall";
import { Construct } from "constructs";

/**
 * A firewall for a Next.js application, to be passed to the distribution of a
 * NextApp. In addition to the default rules of the @see Firewall, it:
 * - Blocks requests that carry the internal `x-middleware-subrequest` header.
 * - Excludes static assets and optimized images from the rate limit, because
 *   every page view requests many of those and CloudFront applies the firewall
 *   before its cache.
 *
 * Custom `rules` are evaluated after the Next.js rules. A custom `rateLimit`
 * replaces the Next.js rate limit.
 */
export class NextAppFirewall extends Firewall {
  /**
   * Blocks requests that carry the internal `x-middleware-subrequest` header,
   * which was used to bypass middleware (including authorization checks) in
   * vulnerable Next.js versions. Next.js only sets this header internally, so
   * it should never be sent by clients.
   * @see https://nextjs.org/blog/cve-2025-29927
   */
  static readonly middlewareSubrequestRule: FirewallRule = {
    name: "NextMiddlewareSubrequest",
    action: { block: {} },
    statement: {
      sizeConstraintStatement: {
        fieldToMatch: { singleHeader: { Name: "x-middleware-subrequest" } },
        comparisonOperator: "GT",
        size: 0,
        textTransformations: [{ priority: 0, type: "NONE" }],
      },
    },
  };

  static readonly nextRateLimit: RateLimitProps = {
    limit: 2000,
    excludePaths: ["/_next/static/", "/_next/image"],
  };

  constructor(scope: Construct, id: string, props: FirewallProps = {}) {
    super(scope, id, {
      ...props,
      rules: [NextAppFirewall.middlewareSubrequestRule, ...(props.rules ?? [])],
      rateLimit: props.rateLimit ?? NextAppFirewall.nextRateLimit,
    });
  }
}
