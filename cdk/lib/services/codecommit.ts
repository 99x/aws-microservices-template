import * as codecommit from "aws-cdk-lib/aws-codecommit";
import { Construct } from "constructs";

export const createCodeCommit = (scope: Construct, serviceName: string) => {
  return new codecommit.Repository(scope, "CodeCommitRepo", {
    repositoryName: `${serviceName}-repo`
  });
};
