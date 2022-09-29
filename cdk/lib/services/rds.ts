import * as rds from "aws-cdk-lib/aws-rds";
import { Construct } from "constructs";
import { Duration } from "aws-cdk-lib";
import { Vpc, SecurityGroup, InstanceType } from "aws-cdk-lib/aws-ec2";

export const createDatabase = (
  scope: Construct,
  vpc: Vpc,
  dbSecurityGroup: SecurityGroup,
  dbName: string,
  instanceType: string
) => {
  return new rds.DatabaseInstance(scope, "RdsDatabase", {
    engine: rds.DatabaseInstanceEngine.mysql({
      version: rds.MysqlEngineVersion.VER_8_0_26
    }),
    vpc,
    allocatedStorage: 20,
    securityGroups: [dbSecurityGroup],
    backupRetention: Duration.days(0),
    instanceIdentifier: dbName,
    instanceType: new InstanceType(instanceType),
    credentials: rds.Credentials.fromGeneratedSecret("admin")
  });
};
