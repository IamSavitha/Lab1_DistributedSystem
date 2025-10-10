Lab 1 – Agent Concierge (Python FastAPI)
What this service does

The Agent is a small Python microservice that the frontend can call for trip “concierge” help:

Accepts trip context (location, dates, guests, preferences)

Returns a JSON plan: itinerary suggestions, restaurant recs, packing list

Can later be extended to call external APIs/tools or an LLM

Tech stack

FastAPI (with built-in OpenAPI/Swagger docs)

Pydantic models for request/response

Uvicorn ASGI server

httpx (optional, for calling tools/APIs)

Default ports & URLs

Base URL: http://localhost:8001

Docs/Playground: http://localhost:8001/docs