.DEFAULT_GOAL: test

.PHONY: clean
clean:
	pnpm exec tsc -b --clean
	rm -rf dist

.PHONY: test
test: node_modules dist
	pnpm exec tsc -b test
	pnpm exec vitest run
	$(MAKE) smoketest

dist: node_modules tsconfig.json
	pnpm exec tsc

.PHONY: smoketest
smoketest: dist
	pnpm exec node -e "import('@block65/webcrypto-web-push').then(() => console.log('smoketest ok'))"
