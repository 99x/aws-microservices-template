import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { Project } from 'aws-cdk-lib/aws-codebuild';
import { DatabaseInstance } from 'aws-cdk-lib/aws-rds';
import { Cluster } from 'aws-cdk-lib/aws-eks';
import { Construct } from 'constructs';

import { createBuild, createBuildForDeploying, createBuildForTest } from './codebuild';

const createCodeBuildAction = (actionName: string, project: Project, input: codepipeline.Artifact) => {
  return new codepipeline_actions.CodeBuildAction({
    actionName,
    project,
    input
  });
};

export const createPipeline = (
  scope: Construct,
  coderepository: codecommit.Repository,
  cluster: Cluster,
  ecrRepo: ecr.Repository,
  db: DatabaseInstance,
  env: string,
  serviceName: string
) => {
  const sourceOutput = new codepipeline.Artifact();

  const sourceAction = new codepipeline_actions.CodeCommitSourceAction({
    actionName: 'CodeCommit',
    repository: coderepository,
    branch: env,
    output: sourceOutput
  });

  const buildAction = createCodeBuildAction(
    'BuildDockerAndPushToEcr',
    createBuild(scope, ecrRepo, env, serviceName),
    sourceOutput
  );

  const test = createCodeBuildAction('UnitTests', createBuildForTest(scope, env, serviceName), sourceOutput);

  let stages: codepipeline.StageProps[] = [
    {
      stageName: 'Source',
      actions: [sourceAction]
    },
    {
      stageName: 'Test',
      actions: [test]
    },
    {
      stageName: 'Build',
      actions: [buildAction]
    }
  ];

  const deploy = createCodeBuildAction(
    'DeployToEksFromEcr',
    createBuildForDeploying(scope, cluster, ecrRepo, db, env, serviceName),
    sourceOutput
  );
  stages = [
    ...stages,

    {
      stageName: 'Deploy',
      actions: [deploy]
    }
  ];

  return new codepipeline.Pipeline(scope, `CodePipeline${env}`, {
    pipelineName: `${env}-pipeline`,
    stages
  });
};
