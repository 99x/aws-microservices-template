import * as eks from 'aws-cdk-lib/aws-eks';
import { InstanceType, IVpc } from 'aws-cdk-lib/aws-ec2';
import { Role } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export const createEksCluster = (scope: Construct, vpc: IVpc, eksAdminRole: Role, serviceName: string) => {
  return new eks.Cluster(scope, 'EksCluster', {
    vpc,
    defaultCapacity: 0,
    mastersRole: eksAdminRole,
    albController: { version: eks.AlbControllerVersion.V2_4_1 },
    version: eks.KubernetesVersion.V1_21,
    clusterName: `${serviceName}-eks-cluster`,
    outputClusterName: true,
    outputConfigCommand: true,
    outputMastersRoleArn: true
  });
};

export const createEksNodeGroup = (
  scope: Construct,
  cluster: eks.Cluster,
  nodeRole: Role,
  serviceName: string,
  instanceType: string
) => {
  return new eks.Nodegroup(scope, 'EksNodeGroup', {
    nodegroupName: `${serviceName}-eks-nodegroup`,
    cluster,
    amiType: eks.NodegroupAmiType.AL2_X86_64,
    instanceTypes: [new InstanceType(instanceType)],
    minSize: 4,
    maxSize: 5,
    nodeRole
  });
};
