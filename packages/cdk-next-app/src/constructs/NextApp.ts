import { Construct } from "constructs";
import {
  AmplifyApp,
  AmplifyAppProps,
  Framework,
  Platform,
  RewriteStatus,
} from "@codedazur/cdk-amplify-app";

export interface NextAppProps
  extends Omit<
    AmplifyAppProps,
    "platform" | "framework" | "buildSpec" | "headers"
  > {}

/**
 * @todo Document that if this is used with a monorepo, the `next.config.js`
 * needs to contain
 * ```
 * {
 *   experimental: {
 *     outputFileTracingRoot: path.join(__dirname, "../../"),
 *   },
 * }
 * ```
 * assuming that the project root is at `"../../"` relative to the the
 * `next.config.js` file.
 * @see https://github.com/aws-amplify/amplify-hosting/issues/3179
 * @see https://nextjs.org/docs/advanced-features/output-file-tracing#caveats
 */
export class NextApp extends AmplifyApp {
  constructor(scope: Construct, id: string, props: NextAppProps) {
    super(scope, id, {
      platform: Platform.WEB_COMPUTE,
      framework: Framework.NEXTJS_SSR,
      buildSpec: {
        version: 1,
        applications: [
          {
            appRoot: props.source.directory,
            frontend: {
              phases: {
                preBuild: {
                  commands: [
                    "npm config set //registry.npmjs.org/:_authToken ${NPM_TOKEN}",
                    "npm install",
                  ],
                },
                build: {
                  commands: ["npm run build"],
                },
                postBuild: {
                  commands: [
                    /**
                     * This command moves the Next.js `standalone` directory
                     * into the right location for AWS to recognize it.
                     * @todo Remove this command when AWS has implemented a fix.
                     * @see https://github.com/aws-amplify/amplify-hosting/issues/3179
                     */
                    `cp -r .next/standalone/${props.source.directory}/. .next/standalone`,
                  ],
                },
              },
              artifacts: {
                baseDirectory: ".next",
                files: ["**/*"],
              },
              cache: {
                paths: ["node_modules/**/*"],
              },
            },
          },
        ],
      },
      rewrites: [
        {
          source: "/<*>",
          status: RewriteStatus.NOT_FOUND,
          target: "/index.html",
        },
        ...(props.rewrites ?? []),
      ],
      ...props,
    });
  }
}
