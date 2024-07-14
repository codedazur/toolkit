import { StaticSite, StaticSiteProps } from "@codedazur/cdk-static-site";
import { FunctionCode } from "aws-cdk-lib/aws-cloudfront";
import { Construct } from "constructs";

export interface SanitySiteProps extends StaticSiteProps {}

export class SanitySite extends StaticSite {
  constructor(scope: Construct, id: string, props: SanitySiteProps) {
    super(scope, id, {
      ...props,
      distribution: {
        ...props.distribution,
        functions: {
          ...props.distribution?.functions,
          viewerRequest: [
            ...(props.distribution?.functions?.viewerRequest ?? []),
            FunctionCode.fromInline(/* js */ `
              function rewriteToIndex(event, next) {
                if (!event.request.uri.match(/.*.[^?]*$/)) {
                  event.request.uri = "/index.html";
                }

                return next(event);
              }
            `),
          ],
        },
      },
    });
  }
}
