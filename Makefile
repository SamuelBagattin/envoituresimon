JQ ?= $(shell which jq)
DOCKER         ?= $(shell which docker)
DOCKER_IMAGE_OWNER ?= samuelbagattin
DOCKER_IMAGE_NAME ?= envoituresimone
DOCKER_IMAGE_REPO    ?= ghcr.io/$(DOCKER_IMAGE_OWNER)/$(DOCKER_IMAGE_NAME)
DOCKER_IMAGE_VERSION ?= $(shell dotnet gitversion | $(JQ) -r ".SemVer")
DOCKER_IMAGE         ?= $(DOCKER_IMAGE_REPO):$(DOCKER_IMAGE_VERSION)



.PHONY: build-push-image
build-push-image:
	$(DOCKER) build . -t $(DOCKER_IMAGE)
	$(DOCKER) push $(DOCKER_IMAGE)

