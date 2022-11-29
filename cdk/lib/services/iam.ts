import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export const createEksClusterAdminRole = (scope: Construct, serviceName: string) => {
  return new iam.Role(scope, 'ClusterAdminRole', {
    roleName: `${serviceName}-eks-admin-role`,
    assumedBy: new iam.AccountRootPrincipal()
  });
};

export const createEksNodeRole = (scope: Construct, serviceName: string) => {
  const nodeRole = new iam.Role(scope, 'EksNodeRole', {
    roleName: `${serviceName}-eks-node-role`,
    assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
    managedPolicies: [
      iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEKSWorkerNodePolicy'),
      iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ContainerRegistryReadOnly'),
      iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEKS_CNI_Policy'),
      iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonRDSFullAccess'),
      iam.ManagedPolicy.fromAwsManagedPolicyName('SecretsManagerReadWrite'),
      iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchLogsFullAccess')
    ]
  });
  return nodeRole;
};
