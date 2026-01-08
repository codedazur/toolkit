import { CfnOutput } from "aws-cdk-lib";
import {
  CfnEIP,
  CfnKeyPair,
  Instance,
  InstanceClass,
  InstanceSize,
  InstanceType,
  IPeer,
  IVpc,
  MachineImage,
  Port,
  SecurityGroup,
  SubnetType,
} from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

export interface BastionHostProps {
  readonly vpc: IVpc;
  readonly ingress: { peer: IPeer; port: Port }[];
  readonly publicKey: string;
}

export class BastionHost extends Construct {
  protected readonly securityGroup: SecurityGroup;
  protected readonly instance: Instance;
  protected readonly elasticIp: CfnEIP;

  constructor(
    scope: Construct,
    id: string,
    { vpc, ingress, publicKey }: BastionHostProps,
  ) {
    super(scope, id);

    this.securityGroup = new SecurityGroup(this, "SecurityGroup", { vpc });

    for (const { peer, port } of ingress) {
      this.securityGroup.addIngressRule(peer, Port.tcp(22));
      this.securityGroup.addIngressRule(peer, port);
    }

    const keyName = this.node.path + "/KeyPair";

    new CfnKeyPair(this, "Key", {
      keyName,
      publicKeyMaterial: publicKey,
    });

    this.instance = new Instance(this, "Instance", {
      vpc,
      vpcSubnets: {
        subnetType: SubnetType.PUBLIC,
      },
      securityGroup: this.securityGroup,
      instanceType: InstanceType.of(
        InstanceClass.BURSTABLE3,
        InstanceSize.NANO,
      ),
      machineImage: MachineImage.latestAmazonLinux2023(),
      keyName,
    });

    this.elasticIp = new CfnEIP(this, "ElasticIP", {
      instanceId: this.instance.instanceId,
    });

    new CfnOutput(this, "IPAddress", {
      value: this.elasticIp.attrPublicIp,
    });
  }
}
