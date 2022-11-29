#!/bin/bash

kubectl delete deployment,service order-app-dev
kubectl delete deployment,service order-app-prod
kubectl delete ingress order-app-alb