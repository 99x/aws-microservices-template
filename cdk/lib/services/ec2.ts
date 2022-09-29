import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";
import { Cluster } from "aws-cdk-lib/aws-eks";

export const createVpc = (scope: Construct, serviceName: string) => {
  return new ec2.Vpc(scope, "VPC", {
    vpcName: `${serviceName}-vpc`,
    maxAzs: 2,
    natGateways: 2
  });
};

export const createDbSecurityGroup = (
  scope: Construct,
  vpc: ec2.IVpc,
  cluster: Cluster,
  serviceName: string,
  dbPort: number
) => {
  const sg = new ec2.SecurityGroup(scope, "DatabaseSecurityGroup", {
    securityGroupName: `${serviceName}-rds-sg`,
    vpc,
    allowAllOutbound: true
  });

  sg.addIngressRule(
    cluster.clusterSecurityGroup,
    ec2.Port.tcp(dbPort),
    `Inbound traffic from port ${dbPort} allowed from EKS`
  );

  return sg;
};
