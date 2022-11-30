# Runbook to setup and deploy the CDK and Order NodeJS applications

## Pre-requisites

- NodeJS - https://nodejs.org/en/ (16+ should be ideal, project was developed using 16.13.1)
- AWS CLI - https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html - (CLIv2, run `aws configure` to connect your AWS account)
- AWS CDK - https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html
- kubectl - https://kubernetes.io/docs/tasks/tools/
- Git - https://git-scm.com/downloads

## Setting up the CDK project

1. Clone the github project

2. There will be two folders, `api` and `cdk`. The first one is the NodeJS application and the second one is the CDK project.

3. Run the following command inside the `cdk` folder

```
npm install
```

4. Once the node modules are installed, run the following command to deploy the CDK Project. (you might have to bootstrap CDK, if you haven't done already https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html)

```
cdk deploy
```

5. The deployment will take roughly 20 - 30 minutes. Provisioning the EKS cluster takes a bit of time.

6. After the deployment completes, you will see an output in the terminal, with the Codecommit clone URL and the EKS cluster config command..

7. Copy the command thats available in the `CwCdkAppStack.EksClusterConfigCommand` output.

```
aws eks update-kubeconfig --name order-app-cluster --region ap-south-1 --role-arn arn:aws:iam::570731846349:role/order-app-admin-role
```

8. Paste this command in another terminal and run it, this will configure the kubectl to communicate with our EKS cluster.

9. Run the following command to check if everything is working as inteded.

```
kubectl get po -A
```

10. If you see all nodes and services running, that means the cluster has been configured correctly. Make sure that the `aws-load-balancer-controller` is running. The controller is required to provision ALB required by the k8s application.

## Setting up the NodeJS express Application

1. Clone the github project

2. There will be two folders, `api` and `cdk`. The first one is the NodeJS application and the second one is the CDK project.

3. Run the following command inside the `api` folder

```
npm install
```

4. The Codecommit repo clone URL will be also available in the final output of the `cdk deploy` command when setting up the CDK project. If you didnt get the clone URL from there you can get it from within the AWS console. The clone URL should be something like https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/order-app-repo.
5. Run the following command to intitialize an empty Git project.

```
git init
```

6. Add the codecomit clone URL as a new remote.

```
git remote add origin https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/order-app-repo
```

7. Create dev and prod branches and push the code to codecommit.

8. When CodeCommit credentials are requested, make sure you generated it for your IAM user. (https://docs.aws.amazon.com/codecommit/latest/userguide/setting-up-gc.html)

9. When the code is pushed successfully, the relevant pipelines should get triggered automatically.

10. You can observe the pipelines getting triggered in your AWS console.

11. Once the deployment is complete, run the following command to get the Classic Load Balancer URLs for your dev and test environments.

```
kubectl get svc
```

12. You can also run the following command to get the Application Load Balancer URLs for your prod environment.

```
kubectl get ingress
```

13. The following commands can also be optionally used to check if the deployment and pods are running correctly.

```
kubectl get deployment
kubectl get pod
```



## Delete the k8s services

- To delete all the k8s services provisioned run the following commands.

```
kubectl delete deployment,service order-app-dev
kubectl delete deployment,service order-app-prod
kubectl delete ingress order-app-alb
```

### Destroy the CDK project

- Deleting the CDK project, will remove all the resources deployed to AWS as part of this stack.

- Make sure you have deleted any and all services running inside the cluster before deleting the CDK stack, to ensure a smooth delete process.

- Run the following command to delete the CDK stack

```
cdk destroy
```

- Manually delete the ECR repo, and S3 artifacts buckets provisioned as part of this stack. Since these will contain data, CDK (CloudFormation) will not automatically delete these resources.
