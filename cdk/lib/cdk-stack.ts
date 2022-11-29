import * as cdk from 'aws-cdk-lib';
import { CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { SERVICE_NAME, EKS_EC2_INSTANCE_TYPE, RDS_EC2_INSTANCE_TYPE, DB_NAME, DB_PORT } from './env.json';

import { createRepository } from './services/ecr';
import { createCodeCommit } from './services/codecommit';
import { createDbSecurityGroup, createVpc } from './services/ec2';
import { createEksCluster, createEksNodeGroup } from './services/eks';
import { createEksClusterAdminRole, createEksNodeRole } from './services/iam';
import { createDatabase } from './services/rds';
import { createPipeline } from './services/codepipeline';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const ecrRepo = createRepository(this, SERVICE_NAME);

    const codeRepository = createCodeCommit(this, SERVICE_NAME);

    const vpc = createVpc(this, SERVICE_NAME);

    const cluster = createEksCluster(this, vpc, createEksClusterAdminRole(this, SERVICE_NAME), SERVICE_NAME);

    const nodeGroup = createEksNodeGroup(
      this,
      cluster,
      createEksNodeRole(this, SERVICE_NAME),
      SERVICE_NAME,
      EKS_EC2_INSTANCE_TYPE
    );

    const db = createDatabase(
      this,
      vpc,
      createDbSecurityGroup(this, vpc, cluster, SERVICE_NAME, DB_PORT),
      DB_NAME,
      RDS_EC2_INSTANCE_TYPE
    );

    const devPipeline = createPipeline(this, codeRepository, cluster, ecrRepo, db, 'dev', SERVICE_NAME);

    const prodPipeline = createPipeline(this, codeRepository, cluster, ecrRepo, db, 'prod', SERVICE_NAME);

    new CfnOutput(this, 'RDS-Secret-ARN', { value: db.secret!.secretName });
    new CfnOutput(this, 'DevCodePipeline', { value: devPipeline.pipelineName });
    new CfnOutput(this, 'ProdCodePipeline', {
      value: prodPipeline.pipelineName
    });
    new CfnOutput(this, 'CodeCommitRepoName', {
      value: codeRepository.repositoryName
    });
    new CfnOutput(this, 'CodeCommitRepoArn', {
      value: codeRepository.repositoryArn
    });
    new CfnOutput(this, 'CodeCommitCloneUrlSsh', {
      value: codeRepository.repositoryCloneUrlHttp
    });
    new CfnOutput(this, 'ECR Repo', { value: ecrRepo.repositoryUri });
  }
}
