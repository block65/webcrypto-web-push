.DEFAULT_GOAL := build

.PHONY: build
build: node_modules
	pnpm exec tsc -b

.PHONY: dev
dev: node_modules
	pnpm exec tsc -b -w

.PHONY: clean
clean: node_modules
	pnpm exec tsc -b --clean

.PHONY: distclean
distclean: clean
	rm -rf node_modules

node_modules: package.json
	pnpm install

.PHONY: test
test: node_modules
	pnpm run -r test

.PHONY: format
format: node_modules
	pnpm exec biome format . --fix

.PHONY: lint
lint: node_modules
	pnpm exec biome lint . --fix
	pnpx sort-package-json package.json packages/*/package.json examples/*/package.json
