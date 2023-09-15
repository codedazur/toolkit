import { pascalCase } from "@codedazur/essentials";
import { RemovalPolicy, SecretValue } from "aws-cdk-lib";
import {
  CfnApp,
  CfnAppProps,
  CfnBranch,
  CfnDomain,
} from "aws-cdk-lib/aws-amplify";
import { Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { LogGroup, RetentionDays } from "aws-cdk-lib/aws-logs";
import { ISecret, Secret } from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";
import YAML from "yaml";

export interface AmplifyAppProps {
  source: GitSource;
  name?: string;
  platform?: Platform;
  framework?: Framework;
  buildSpec?: BuildSpec;
  environment?: Environment;
  rewrites?: Rewrite[];
  redirects?: Redirect[];
  basicAuth?: BasicAuth;
  branches?: {
    [key: string]: Branch;
    production: Branch;
  };
  branchPreviews?: string[];
  domains: string[];
  headers?: Headers;
}

export enum Platform {
  WEB = "WEB",
  WEB_COMPUTE = "WEB_COMPUTE",
}

/**
 * @todo Export additional frameworks.
 */
export enum Framework {
  NEXTJS_SSR = "Next.js - SSR",
}

export interface GitSource {
  registry: GitRegistry;
  owner: string;
  repository: string;
  directory?: string;
  token?: SecretValue;
}

export enum GitRegistry {
  GITHUB = "https://github.com",
  BITBUCKET = "https://bitbucket.org",
}

export interface BuildSpec {
  version: number;
  applications: {
    appRoot?: string;
    env?: {
      [key: string]: string;
    };
    backend?: {
      phases?: {
        preBuild?: {
          commands: string[];
        };
        build?: {
          commands: string[];
        };
        postBuild?: {
          commands: string[];
        };
      };
    };
    frontend?: {
      phases?: {
        preBuild?: {
          commands: string[];
        };
        build?: {
          commands: string[];
        };
        postBuild?: {
          commands: string[];
        };
      };
      artifacts?: {
        baseDirectory: string;
        files: string[];
      };
      cache?: {
        paths: string[];
      };
    };
    test?: {
      phases?: {
        preTest?: {
          commands: string[];
        };
        test?: {
          commands: string[];
        };
        postTest?: {
          commands: string[];
        };
      };
      artifacts?: {
        baseDirectory: string;
        files: string[];
      };
    };
  }[];
}

export interface Environment {
  [key: string]: string | number | boolean | SecretValue | undefined;
}

export interface Headers {
  [key: string]: { [key: string]: string };
}

export interface Rewrite {
  source: string;
  target: string;
  status: RewriteStatus;
}

export interface Redirect {
  source: string;
  target: string;
  status: RedirectStatus;
}

export enum RedirectStatus {
  NOT_FOUND = "404",
  MOVED_PERMANENTLY = "301",
  MOVED_TEMPORARILY = "302",
}

export enum RewriteStatus {
  OK = "200",
  NOT_FOUND = "404-200",
}

export type BasicAuth =
  | false
  | {
      username: string;
      password?: SecretValue;
    };

export interface Branch {
  name: string;
  performanceMode?: boolean;
  autoBuild?: boolean;
  pullRequestPreviews?: boolean;
  basicAuth?: BasicAuth;
}

/**
 * @todo Avoid the `NPM_TOKEN` environment variable from being readable in the
 * AWS Amplify console.
 * @todo Create a LogGroup that the Amplify app's SSR Lambda can write to.
 * @todo Configure the `ProductionBranch` as the "production" branch so that its
 * status is reported on the Amplify home page. I'm not sure if this is possible
 * via CloudFormation at the moment.
 * @todo Create a `TriggerFunction` that calls `amplify.startDeployment(branch)`
 * after the `AmplifyApp` itself has been deployed. This does not happen at the
 * moment, causing any updates to the `AmplifyApp` to only be reflected in the
 * deployment of the _next_ commit, since Amplify already starts deploying
 * before CDK is done deploying. If we do this, however, we will have both CDK
 * _and_ Amplify triggering deployments for every commit, which is confusing and
 * redundant. It might be better to disable Amplify's `autoBuild` in this case,
 * as long as the `autoBranchCreation` and `enablePullRequestPreview` features
 * can still remain enabled.
 * @todo Add support for commonly used alarms and canaries.
 * @todo Support deployment from a local asset instead of a repository.
 */
export class AmplifyApp extends Construct {
  private _gitHubTokenSecret?: ISecret;
  private _bitbucketTokenSecret?: ISecret;
  private _npmTokenSecret?: ISecret;
  private _basicAuthPasswordSecret?: ISecret;

  private get gitHubToken() {
    if (!this._gitHubTokenSecret) {
      this._gitHubTokenSecret = Secret.fromSecretNameV2(
        this,
        "GitHubTokenSecret",
        "GitHubToken",
      );
    }

    return this._gitHubTokenSecret.secretValue;
  }

  private get bitbucketToken() {
    if (!this._bitbucketTokenSecret) {
      this._bitbucketTokenSecret = Secret.fromSecretNameV2(
        this,
        "BitbucketTokenSecret",
        "BitbucketToken",
      );
    }

    return this._bitbucketTokenSecret.secretValue;
  }

  private get npmToken() {
    if (!this._npmTokenSecret) {
      this._npmTokenSecret = Secret.fromSecretNameV2(
        this,
        "NPMTokenSecret",
        "NPMToken",
      );
    }

    return this._npmTokenSecret.secretValue;
  }

  private get basicAuthPassword() {
    if (!this._basicAuthPasswordSecret) {
      this._basicAuthPasswordSecret = new Secret(
        this,
        `BasicAuthPasswordSecret`,
      );
    }

    return this._basicAuthPasswordSecret.secretValue;
  }

  constructor(
    scope: Construct,
    id: string,
    {
      name,
      platform,
      framework,
      buildSpec,
      source: {
        registry = GitRegistry.BITBUCKET,
        owner = "codedazur",
        repository,
        directory,
        token,
      },
      environment = {},
      rewrites = [],
      redirects = [],
      basicAuth,
      branches = { production: { name: "main" } },
      branchPreviews = [],
      domains = [],
      headers,
    }: AmplifyAppProps,
  ) {
    super(scope, id);

    const gitToken = token ?? this.gitTokenFromSecret(registry);

    const role = new Role(this, "AmplifyRole", {
      assumedBy: new ServicePrincipal("amplify.amazonaws.com"),
    });

    const app = new CfnApp(this, "AmplifyApp", {
      name: name ?? this.node.path,
      repository: this.repositoryUrl({ registry, owner, repository }),
      platform,
      environmentVariables: this.environmentVariables({
        AMPLIFY_MONOREPO_APP_ROOT: directory,
        AMPLIFY_DIFF_DEPLOY: directory ? false : undefined,
        NPM_TOKEN: this.npmToken,
        ...environment,
      }),
      buildSpec: buildSpec ? this.buildSpec(buildSpec) : undefined,
      autoBranchCreationConfig: {
        framework,
        enableAutoBranchCreation: branchPreviews.length > 0,
        autoBranchCreationPatterns: branchPreviews,
        enableAutoBuild: true,
        enablePullRequestPreview: false,
        // basicAuthConfig
        // buildSpec
        // enablePerformanceMode
        // environmentVariables
        // pullRequestEnvironmentName
        // stage
      },
      enableBranchAutoDeletion: true,
      accessToken:
        registry === GitRegistry.GITHUB ? gitToken.toString() : undefined,
      oauthToken:
        registry !== GitRegistry.GITHUB ? gitToken.toString() : undefined,
      customRules: [...rewrites, ...redirects],
      basicAuthConfig: this.basicAuth(basicAuth),
      iamServiceRole: role.roleArn,
      customHeaders: headers ? this.headers(headers) : undefined,
      // description
      // tags
    });

    const logGroup = new LogGroup(app, "LogGroup", {
      logGroupName: `/aws/amplify/${app.attrAppId}`,
      retention: RetentionDays.TWO_WEEKS,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    logGroup.grantWrite(role);

    const cfnBranches = Object.entries(branches).map(
      ([
        key,
        {
          name,
          autoBuild = true,
          performanceMode = false,
          pullRequestPreviews = true,
          basicAuth,
        },
      ]) =>
        new CfnBranch(app, pascalCase(`${key}Branch`), {
          appId: app.attrAppId,
          branchName: name,
          enableAutoBuild: autoBuild,
          enablePerformanceMode: performanceMode,
          enablePullRequestPreview: pullRequestPreviews,
          framework,
          basicAuthConfig: this.basicAuth(basicAuth),
          // buildSpec
          // description
          // environmentVariables
          // pullRequestEnvironmentName
          // stage
          // tags
        }),
    );

    for (const [index, domain] of domains.entries()) {
      const cfnDomain = new CfnDomain(app, `Domain${index + 1}`, {
        appId: app.attrAppId,
        domainName: domain,
        subDomainSettings: Object.entries(branches).map(([key, { name }]) => ({
          branchName: name,
          prefix: key === "production" ? "" : key,
        })),
        enableAutoSubDomain: true,
        autoSubDomainIamRole: role.roleArn,
        autoSubDomainCreationPatterns: branchPreviews,
      });

      for (const cfnBranch of cfnBranches) {
        cfnDomain.addDependsOn(cfnBranch);
      }
    }
  }

  protected buildSpec(buildSpec: BuildSpec): CfnAppProps["buildSpec"] {
    return YAML.stringify(buildSpec);
  }

  protected environmentVariables(
    environment: Environment,
  ): CfnAppProps["environmentVariables"] {
    return Object.entries(environment)
      .filter(([, value]) => value !== undefined)
      .map(([name, value]) => ({
        name,
        value: value?.toString() ?? "",
      }));
  }

  protected gitTokenFromSecret(registry: GitRegistry): SecretValue {
    switch (registry) {
      case GitRegistry.GITHUB:
        return this.gitHubToken;
      case GitRegistry.BITBUCKET:
        return this.bitbucketToken;
    }
  }

  protected repositoryUrl({ registry, owner, repository }: GitSource) {
    return [registry, owner, repository].join("/");
  }

  protected headers(headers: Headers) {
    return YAML.stringify(headers);
  }

  protected basicAuth(
    basicAuth: BasicAuth | undefined,
  ): CfnApp["basicAuthConfig"] & CfnBranch["basicAuthConfig"] {
    if (basicAuth === false) {
      return {
        enableBasicAuth: false,
        /**
         * @todo The @see CfnBranch.BasicAuthConfigProperty incorrectly requires
         * a `username` and `password` to be set even when the `enableBasicAuth`
         * property is `false`.
         */
        username: "",
        password: "",
      };
    }

    return basicAuth
      ? {
          enableBasicAuth: true,
          username: basicAuth.username,
          password: (basicAuth.password ?? this.basicAuthPassword).toString(),
        }
      : undefined;
  }
}
