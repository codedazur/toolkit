import {
  RewriteMode,
  StaticSite,
  StaticSiteProps,
} from "@codedazur/cdk-static-site";
import { Construct } from "constructs";

export interface SanitySiteProps extends Omit<StaticSiteProps, "rewriteMode"> {}

/**
 * @deprecated Please use the `StaticSite` construct instead with the
 * `rewriteMode` set to `RewriteMode.SinglePage`.
 */
export class SanitySite extends StaticSite {
  constructor(scope: Construct, id: string, props: SanitySiteProps) {
    super(scope, id, {
      ...props,
      rewriteMode: RewriteMode.SinglePage,
    });
  }
}
