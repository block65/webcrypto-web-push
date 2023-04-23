
SRCS = $(wildcard lib/**)

all: dist

.PHONY: deps
deps: node_modules

.PHONY: clean
clean:
	pnpm tsc -b --clean

.PHONY: test
test:
	pnpm vitest

node_modules: package.json
	pnpm install

dist: node_modules tsconfig-lib.json $(SRCS)
	pnpm tsc -b tsconfig-lib.json

.PHONY: dist-watch
dist-watch:
	pnpm tsc -w --preserveWatchOutput

.PHONY: pretty
pretty: node_modules
	pnpm eslint --fix .
	pnpm prettier --write .


.PHONY: dev-server
dev-server:
	pnpm wrangler dev src/worker.ts
