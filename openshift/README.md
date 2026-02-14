# Deploy H_project (PlanMyStay) on OpenShift

## Prerequisites

- OpenShift CLI (`oc`) or Kubernetes CLI (`kubectl`)
- Docker or Podman to build the image
- MongoDB available (in-cluster or external) — set `MONGODB_URI` in the secret

## 1. Build and push the image

From the project root (where `Dockerfile` is):

```bash
# Build
docker build -t h-project:latest .

# Tag for your OpenShift image registry (replace with your registry URL)
# docker tag h-project:latest <registry>/<namespace>/h-project:latest
# docker push <registry>/<namespace>/h-project:latest

# Or use OpenShift internal registry after logging in:
# oc login ...
# oc new-project myapp
# docker tag h-project:latest image-registry.openshift-image-registry.svc:5000/myapp/h-project:latest
# docker push image-registry.openshift-image-registry.svc:5000/myapp/h-project:latest
```

Using OpenShift build (no external Docker needed):

```bash
oc new-build --name h-project --binary --strategy=docker
oc start-build h-project --from-dir=. --follow
```

Then use image stream in deployment: set `image: h-project:latest` (or the image stream tag your build produced).

## 2. Configure MongoDB and secret

Edit `openshift/secret.yaml` or the `stringData` in `openshift/all-in-one.yaml`:

- **MONGODB_URI**: e.g. `mongodb://mongo:27017/planmystay` if MongoDB is a service named `mongo` in the same namespace, or your external MongoDB URL.
- **SESSION_SECRET**: a strong random string for production.

## 3. Deploy

**Option A – Apply everything at once**

```bash
# Edit secret in openshift/all-in-one.yaml first, then:
oc apply -f openshift/all-in-one.yaml
```

**Option B – Apply resources separately**

```bash
oc apply -f openshift/configmap.yaml
oc apply -f openshift/secret.yaml
oc apply -f openshift/deployment.yaml
oc apply -f openshift/service.yaml
oc apply -f openshift/route.yaml
```

## 4. Get the app URL

```bash
oc get route h-project
```

Open the **Host** URL in a browser.

## 5. Update deployment image

If you use an image registry:

1. Update `openshift/deployment.yaml` (or `all-in-one.yaml`) with the full image name, e.g. `image: <registry>/<namespace>/h-project:latest`.
2. Run `oc apply -f openshift/deployment.yaml` (or `-f openshift/all-in-one.yaml`).

## Files

| File | Purpose |
|------|--------|
| `configmap.yaml` | NODE_ENV, PORT |
| `secret.yaml` | MONGODB_URI, SESSION_SECRET |
| `deployment.yaml` | Pod spec, probes, env from ConfigMap/Secret |
| `service.yaml` | ClusterIP service on port 8080 |
| `route.yaml` | OpenShift Route (HTTPS) |
| `all-in-one.yaml` | Single file to apply all of the above |
