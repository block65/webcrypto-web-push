.DEFAULT_GOAL := build

.PHONY: build
build: node_modules
	pnpm exec tsc -b packages/web-push

.PHONY: dev
dev: node_modules
	pnpm exec tsc -b packages/web-push -w

.PHONY: clean
clean: node_modules
	pnpm exec tsc -b packages/web-push --clean
	rm -rf packages/web-push/dist

.PHONY: distclean
distclean: clean
	rm -rf node_modules

node_modules: package.json
	pnpm install

.PHONY: test
test: node_modules
	pnpm run -r test

.PHONY: e2e
e2e: node_modules build
	pnpm --filter e2e run e2e

.PHONY: format
format: node_modules
	pnpm exec oxfmt

.PHONY: lint
lint: node_modules
	pnpm exec oxlint --fix
