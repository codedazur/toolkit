# @codedazur/cdk-bastion-host

This construct creates a nano-sized EC2 instance with an associated key-pair in the public subnet of the provided VPC. This allows owners of the private key of the key-pair to connect to services on private subnets of that VPC, using this bastion host as an SSH tunnel. Only traffic from whitelisted IP addresses and over whitelisted ports is allowed.

A common use-case for a bastion host is to allow remote connections to private databases. The reason this is more secure than making the database public is that in addition to the database's password, you now also need the private key to connect, and you need to be on one of the whitelisted IP addresses.

## Installation

```bash
npm install @codedazur/cdk-bastion-host
```

## Creation

First, generate an SSH key. You will need to use the private key of the this key-pair to connect to the bastion host via SSH, and you will need to provide the public key to the `BastionHost` construct. This public key does not need to be kept secret, so it would technically be safe to hard-code it in your CDK code, but it is best practice to parameterize it, for example using an environment variable.

```ts
import { BastionHost } from "@codedazur/cdk-bastion-host";
import { Peer, Port, VPC } from "aws-cdk-lib/aws-ec2";
import { DatabaseInstance } from "aws-cdk-lib/aws-rds";

const myVpc = new Vpc(this, "MyVpc", {
  ...
});

const myDatabaseInstance = new DatabaseInstance(this, "MyDatabaseInstance", {
  vpc: myVpc,
  vpcSubnets: {
    subnetType: SubnetType.PRIVATE_ISOLATED,
  },
  ...
});

new BastionHost(this, "MyBastionHost", {
  vpc: myVpc,
  publicKey: process.env.BASTION_HOST_PUBLIC_KEY!,
  ingress: [
    { peer: Peer.ipv4("62.194.184.12"), port: Port.tcp(5432) },
    { peer: Peer.ipv4("34.199.54.113/32"), port: Port.tcp(5432) },
  ],
});
```

During creation, the construct will output its elastic IP address. If you forgot to note it down at this point, you can find it in the AWS console under the `EC2 > Network & Security > Elastic IPs` tab.

## Connecting

You can use any SSH command to interact with your bastion host, as long as connect from a whitelisted IP address and you have the private key. The user on the bastion host will always be named `ec2-user`.

```bash
ssh ec2-user@{BASTION_HOST_IP_ADDRESS}
```

## Tunneling

Most pieces of software that operate over SSH will have built-in support for SSH tunnels. In this case, please refer to the documentation of the software you are using.

In some cases though, you may want to connect to a private server via SSH directly in your terminal. You can do this by tunneling through your bastion into the private server. In order to set up an SSH tunnel in your terminal, you can use a command such as the following.

```bash
# Set up an SSH tunnel to the bastion host. @see https://superuser.com/a/1314015
ssh \
  -o ExitOnForwardFailure=yes \
  -f \
  -L \
  ${REMOTE_PORT}:${REMOTE_HOST}:${REMOTE_PORT} \
  ec2-user@${BASTION_HOST_IP_ADDRESS} \
  sleep 15 # Using a remote sleep instead of the -N flag will allow the tunnel to close automatically. @see https://unix.stackexchange.com/a/83812
```

Running this command will open a tunnel in the background which will close automatically when it hasn't been used for 15 seconds. With this tunnel open in the background, you can now run SSH commands directly to the remote host in the private subnet. SSH will take care of routing the traffic through the tunnel for you.
