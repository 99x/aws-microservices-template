import { Aws } from 'aws-cdk-lib';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export const createBuild = (scope: Construct, ecrRepo: ecr.Repository, env: string, serviceName: string) => {
  const project = new codebuild.Project(scope, `Build${env}`, {
    projectName: `${serviceName}-build-${env}`,
    environment: {
      privileged: true,
      buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
      computeType: codebuild.ComputeType.SMALL
    },
    environmentVariables: {
      ECR_REPO_URI: {
        value: ecrRepo.repositoryUri
      },
      AWS_ACCOUNT_ID: {
        value: Aws.ACCOUNT_ID
      }
    },
    buildSpec: codebuild.BuildSpec.fromObject({
      version: '0.2',
      phases: {
        pre_build: {
          commands: ['export TAG=${CODEBUILD_RESOLVED_SOURCE_VERSION}']
        },
        build: {
          commands: [
            'npm install',
            'docker build -t $ECR_REPO_URI:${TAG}' + env + ' .',
            'docker logout',
            'aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com',
            'docker push $ECR_REPO_URI:${TAG}' + env,
            'docker logout'
          ]
        }
      }
    })
  });
  ecrRepo.grantPullPush(project.role!);
  project.role?.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMReadOnlyAccess'));
  return project;
};

export const createBuildForTest = (scope: Construct, env: string, serviceName: string) => {
  const project = new codebuild.Project(scope, `TestBuild${env}`, {
    projectName: `${serviceName}-test-build-${env}`,
    environment: {
      privileged: true,
      buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
      computeType: codebuild.ComputeType.SMALL
    },
    buildSpec: codebuild.BuildSpec.fromObject({
      version: '0.2',
      phases: {
        build: {
          commands: ['npm install', 'npm test']
        }
      }
    })
  });

  return project;
};

export const createBuildForDeploying = (
  scope: Construct,
  cluster: eks.Cluster,
  ecrRepo: ecr.Repository,
  db: rds.DatabaseInstance,
  env: string,
  serviceName: string
) => {
  const project = new codebuild.Project(scope, `Deploy${env}`, {
    projectName: `${serviceName}-deploy-build-${env}`,
    environment: {
      privileged: true,
      buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
      computeType: codebuild.ComputeType.SMALL
    },
    environmentVariables: {
      CLUSTER_NAME: {
        value: `${cluster.clusterName}`
      },
      SERVICE_NAME: {
        value: serviceName
      }
    },
    buildSpec: codebuild.BuildSpec.fromObject({
      version: '0.2',
      phases: {
        pre_build: {
          commands: [
            'export TAG=${CODEBUILD_RESOLVED_SOURCE_VERSION}',
            'aws eks --region $AWS_REGION update-kubeconfig --name $CLUSTER_NAME'
          ]
        },
        build: {
          commands: [
            '#!/bin/bash',
            'export TMP=/tmp/tmpDeploy.yaml',
            'export RDS_USERNAME=$(aws secretsmanager get-secret-value --secret-id ' +
              db.secret!.secretName +
              ' | jq .SecretString | jq fromjson.username)',
            'export RDS_PASSWORD=$(aws secretsmanager get-secret-value --secret-id ' +
              db.secret!.secretName +
              ' | jq .SecretString | jq fromjson.password)',
            'export RDS_HOSTNAME=$(aws secretsmanager get-secret-value --secret-id ' +
              db.secret!.secretName +
              ' | jq .SecretString | jq fromjson.host)',
            'export IMAGE_URL=' + ecrRepo.repositoryUri + ':${TAG}' + env,
            'export STAGE=' + env,
            'for filename in k8s/' +
              env +
              '/*.yaml; do envsubst < $filename > ${TMP} | kubectl apply -f ${TMP} || continue ; done;',
            'echo "Initial Deploy complete"'
          ]
        }
      }
    })
  });

  cluster.awsAuth.addMastersRole(project.role!);
  project.role?.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('SecretsManagerReadWrite'));
  project.addToRolePolicy(
    new iam.PolicyStatement({
      actions: ['eks:DescribeCluster'],
      resources: [`${cluster.clusterArn}`]
    })
  );
  return project;
};
