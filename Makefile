.PHONY: backend-test frontend-test docs-build docs-serve diagrams up down

backend-test:
	cd backend && ./mvnw test

frontend-test:
	cd frontend && npm test

docs-build:
	python3 -m pip install --user -r requirements-docs.txt
	./scripts/export-structurizr.sh
	python3 -m mkdocs build

docs-serve:
	python3 -m pip install --user -r requirements-docs.txt
	./scripts/export-structurizr.sh
	python3 -m mkdocs serve

diagrams:
	./scripts/export-structurizr.sh

up:
	docker compose up --build

down:
	docker compose down -v
