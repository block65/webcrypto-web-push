.DEFAULT_GOAL := dev

.PHONY: dev
dev: node_modules
	pnpm exec tsc -b -w

.PHONY: clean
clean:
	pnpm exec tsc -b --clean

.PHONY: distclean
distclean: clean
	rm -rf node_modules


.PHONY: lint
lint: node_modules
	pnpm exec eslint .
	pnpm exec prettier --check .

pnpm-lock.yaml: package.json
	pnpm install

node_modules: pnpm-lock.yaml

.PHONY: test
test:
	pnpm run -r test

.PHONY: pretty
pretty: node_modules
	pnpm exec eslint --fix . || true
	pnpm exec prettier --write .
	pnpx sort-package-json package.json packages/*/package.json examples/*/package.json