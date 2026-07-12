# Kubernetes — Experimental / Learning Notes

This folder is exploratory. The actual deployed app runs on Docker Compose via the `ansible/` pipeline described in the root `README.md`. `deployment-file.yml` here is a first pass at a Kubernetes equivalent, kept for learning purposes and not part of the live deployment path.

## Known Issue in the Current Manifest

The frontend and backend containers are currently defined inside a single Pod. Containers that share a Pod share a network namespace and reach each other over `localhost`, not by any service name. But the frontend's internal proxy is configured to reach the backend at the hostname `backend` — a name that only resolves under Docker Compose's own networking, not inside a shared Kubernetes Pod. As written, the two containers in this manifest can't actually reach each other the way the app expects.

**The fix:** split this into two separate Deployments and two separate Services, each independently scalable, with the frontend pointed at the backend Service's own DNS name. Kubernetes gives every Service a stable internal address automatically — conceptually the same trick Docker Compose already performs with its own service names.

## Prerequisites

`kubectl` and a local cluster — either `minikube` or Docker Desktop's built-in Kubernetes. If both are installed, check which context is active before applying anything:

```bash
kubectl config current-context
```

**Working directory.** `deployment-file.yml` is referenced by relative path below, so every command in this walkthrough assumes you are inside `Efinance_DevOps/K8s`:

```bash
cd DevOps_efinance/Efinance_DevOps/K8s
```

## Step-by-Step Walkthrough

Start a local cluster and confirm it's up:

```bash
minikube start
kubectl get nodes
```

Create the secret the manifest depends on (not created automatically):

```bash
kubectl create secret generic openrouter-secret \
  --from-literal=OPENROUTER_API_KEY=your-key-here
```

Apply the manifest:

```bash
kubectl apply -f deployment-file.yml
```

Confirm the pods started:

```bash
kubectl get pods
```

If a pod is stuck in `Pending` or `CrashLoopBackOff`, inspect it:

```bash
kubectl describe pod <pod-name>
```

Check logs for either container — each pod has two, so `-c` is required:

```bash
kubectl logs <pod-name> -c frontend
kubectl logs <pod-name> -c backend
```

Access the app — since the Service is type `NodePort`, on minikube the simplest way is:

```bash
minikube service app-service --url
```

Try scaling, then confirm:

```bash
kubectl scale deployment webserver --replicas=4
kubectl get pods
```

Clean up when done:

```bash
kubectl delete -f deployment-file.yml
minikube stop
```

## Labels and Selectors

A Service's selector is just a label filter matching a set of Pods.

```bash
kubectl get pods --show-labels
kubectl label pod <pod-name> owner=yourname
kubectl get pods -l owner=yourname
```

## Quick, Throwaway Experiments

Useful for trying something fast without editing YAML — not meant to be kept:

```bash
kubectl create deployment quick-test --image=nginx
kubectl exec -it <pod-name> -- /bin/bash
kubectl delete deployment quick-test
```

Anything meant to be version-controlled or run through a pipeline should go through a YAML file and `kubectl apply -f` instead, which is why `deployment-file.yml` in this folder is a manifest, not a script of one-off commands.

## Concepts, Briefly

A **cluster** is the whole environment — one or more control-plane nodes and one or more worker nodes where applications actually run. A **Pod** is the smallest deployable unit — one or more containers sharing network and storage, inherently short-lived. A **ReplicaSet** keeps a specified number of Pods alive, replacing any that die. A **Deployment** manages ReplicaSets and handles rolling updates when the image or configuration changes.

Because Pods are ephemeral, they need a stable way to be reached — that's what a **Service** provides: reachable only inside the cluster, exposed on a static port on every node, or backed by a cloud load balancer, depending on its type. An **Ingress** sits in front of multiple Services to route HTTP traffic between them (not used in this project yet). A **namespace** partitions a cluster into virtual sub-clusters, and **labels** are the key-value tags Services use to find the right Pods.

On the control plane: the API server is the single entry point every command passes through, backed by `etcd`, a key-value store holding all cluster state — only the API server talks to `etcd` directly. A scheduler decides which node each new Pod lands on; a controller manager continuously reconciles the cluster's actual state with its desired state.

On each worker node: a container runtime runs the containers, the kubelet talks to the control plane and reports node health, and kube-proxy manages that node's routing rules. DNS, monitoring, and logging aren't built into core Kubernetes — they're added on top as their own pods and services, commonly called addons.

## Command Reference

```bash
kubectl get all                       # everything in the current namespace
kubectl get pods -o wide              # pods with extra detail: node, IP, etc.
kubectl describe pod <name>           # full detail on a specific pod
kubectl describe deployment <name>    # full detail on a specific deployment
kubectl api-resources                 # every resource type the cluster knows about
minikube dashboard --url              # open the local cluster's dashboard
minikube ssh                          # shell into the minikube VM itself
```

## Not Yet Explored

- Ansible roles, for organizing playbooks into reusable components
- Ingress controllers, for routing multiple services through a single entry point
- Helm, for templated, parameterized manifests instead of a single static file
