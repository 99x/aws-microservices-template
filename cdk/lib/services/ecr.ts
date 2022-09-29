import * as ecr from "aws-cdk-lib/aws-ecr";
import { RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";

export const createRepository = (scope: Construct, serviceName: string) => {
  return new ecr.Repository(scope, "EcrRepo", {
    repositoryName: `${serviceName}-container-repository`,
    removalPolicy: RemovalPolicy.DESTROY
  });
};
