.DEFAULT_GOAL := dev

.PHONY: dev
dev: node_modules
	pnpm exec tsc -b -w

.PHONY: clean
clean: node_modules
	pnpm exec tsc -b --clean

.PHONY: distclean
distclean: clean
	rm -rf node_modules

.PHONY: lint
lint: node_modules
	pnpm exec eslint .
	pnpm exec prettier --check .

node_modules: package.json
	pnpm install

.PHONY: test
test: node_modules
	pnpm run -r test

.PHONY: pretty
pretty: node_modules
	pnpm exec eslint --fix . || true
	pnpm exec prettier --write .
	pnpx sort-package-json package.json packages/*/package.json examples/*/package.json