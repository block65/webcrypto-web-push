.DEFAULT_GOAL: test

.PHONY: clean
clean:
	pnpm tsc -b --clean

.PHONY: test
test: node_modules dist
	pnpm exec vitest run
	$(MAKE) smoketest

dist: node_modules tsconfig.json
	pnpm exec tsc

.PHONY: smoketest
smoketest: dist
	pnpm exec node -e "import('@block65/webcrypto-web-push').then(() => console.log('smoketest ok')).catch(console.error)"
