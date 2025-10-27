"""
FastAPI Server for AI Travel Agent
Main entry point for the AI Agent service
"""

import os
from typing import Dict, Any, List, Optional
from datetime import datetime

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

import agent
import database

load_dotenv()

app = FastAPI(
    title="AI Travel Concierge Agent",
    description="AI-powered travel planning service using LangChain and Tavily",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response Models

class BookingDates(BaseModel):
    startDate: str = Field(..., description="Check-in date (YYYY-MM-DD)")
    endDate: str = Field(..., description="Check-out date (YYYY-MM-DD)")


class BookingContext(BaseModel):
    bookingId: Optional[int] = Field(None, description="Existing booking ID")
    propertyId: Optional[int] = Field(None, description="Property ID")
    location: Optional[str] = Field(None, description="Destination city")
    dates: Optional[BookingDates] = Field(None, description="Travel dates")
    partyType: str = Field(default="solo", description="Party type: solo, couple, family, friends")
    guests: int = Field(default=1, description="Number of guests")


class TravelPreferences(BaseModel):
    budget: Optional[str] = Field(None, description="Budget level: budget, medium, luxury")
    interests: Optional[List[str]] = Field(default_factory=list, description="User interests")
    dietaryFilters: Optional[List[str]] = Field(default_factory=list, description="Dietary restrictions")
    mobilityNeeds: Optional[List[str]] = Field(default_factory=list, description="Mobility requirements")


class TravelPlanRequest(BaseModel):
    query: str = Field(..., description="Free-text user query")
    bookingContext: BookingContext = Field(..., description="Booking context")
    preferences: Optional[TravelPreferences] = Field(
        default_factory=TravelPreferences,
        description="User preferences (optional, AI will infer if missing)"
    )
    
    class Config:
        schema_extra = {
            "example": {
                "query": "We love museums and good food. We're vegetarian and have two kids.",
                "bookingContext": {
                    "location": "Paris",
                    "dates": {
                        "startDate": "2025-11-01",
                        "endDate": "2025-11-05"
                    },
                    "partyType": "family",
                    "guests": 4
                },
                "preferences": {
                    "budget": "medium",
                    "interests": ["museums", "food", "culture"],
                    "mobilityNeeds": [],
                    "dietaryFilters": ["vegetarian"]
                }
            }
        }


class LocalContext(BaseModel):
    weather: Dict[str, Any]
    events: List[Dict[str, str]]
    transportation: Dict[str, str]


class TravelPlanResponse(BaseModel):
    success: bool
    dayByDayPlan: List[Dict[str, Any]]
    activities: List[Dict[str, Any]]
    restaurants: List[Dict[str, Any]]
    packingChecklist: List[str]
    localContext: LocalContext


# API Endpoints

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "AI Travel Concierge Agent API",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": {
            "health": "/health",
            "plan": "/ai-agent/plan (POST)",
            "docs": "/docs",
            "redoc": "/redoc"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        db_status = database.test_connection()
        
        return {
            "status": "healthy" if db_status else "degraded",
            "database": "connected" if db_status else "disconnected",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "degraded",
            "database": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }


@app.post("/ai-agent/plan", response_model=TravelPlanResponse)
async def generate_travel_plan(request: TravelPlanRequest):
    """
    Generate a personalized travel plan
    
    This endpoint:
    1. Receives user query and travel context
    2. Optionally fetches booking details from MySQL database
    3. Performs Tavily web search for POIs, restaurants, weather, events
    4. Uses LangChain + GPT-4 to generate personalized itinerary
    5. Uses AI to infer user preferences from booking history if not provided
    6. Returns comprehensive travel plan with activities, restaurants, packing list
    """
    try:
        print("=" * 70)
        print("Received travel plan request")
        print(f"Query: {request.query}")
        print(f"Booking Context: {request.bookingContext.dict()}")
        print(f"Preferences: {request.preferences.dict() if request.preferences else {}}")
        print("=" * 70)
        
        # Convert Pydantic models to dictionaries
        booking_context = request.bookingContext.dict()
        
        # Handle optional preferences - if empty, pass empty dict for AI inference
        preferences = request.preferences.dict() if request.preferences else {}
        
        # Generate travel plan using AI agent
        travel_plan = agent.create_travel_plan(
            query=request.query,
            booking_context=booking_context,
            preferences=preferences
        )
        
        if not travel_plan.get("success"):
            raise HTTPException(
                status_code=500,
                detail="Failed to generate travel plan"
            )
        
        print("=" * 70)
        print("Travel plan generated successfully!")
        print(f"Activities: {len(travel_plan.get('activities', []))}")
        print(f"Restaurants: {len(travel_plan.get('restaurants', []))}")
        print(f"Days: {len(travel_plan.get('dayByDayPlan', []))}")
        print("=" * 70)
        
        return travel_plan
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error generating travel plan: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@app.get("/ai-agent/test")
async def test_components():
    """
    Test endpoint to verify all components are working
    """
    results = {
        "database": False,
        "tavily": False,
        "openai": False,
        "errors": []
    }
    
    # Test database
    try:
        results["database"] = database.test_connection()
        if not results["database"]:
            results["errors"].append("Database connection failed")
    except Exception as e:
        results["errors"].append(f"Database error: {str(e)}")
    
    # Test environment variables
    required_vars = ["OPENAI_API_KEY", "TAVILY_API_KEY", "DB_HOST", "DB_NAME"]
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        results["errors"].append(f"Missing environment variables: {', '.join(missing_vars)}")
    else:
        results["openai"] = bool(os.getenv("OPENAI_API_KEY"))
        results["tavily"] = bool(os.getenv("TAVILY_API_KEY"))
    
    return {
        "status": "healthy" if all([results["database"], results["tavily"], results["openai"]]) else "degraded",
        "components": results,
        "timestamp": datetime.now().isoformat()
    }


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    
    print("=" * 70)
    print("Starting AI Travel Concierge Agent Server")
    print(f"Port: {port}")
    print(f"Docs: http://localhost:{port}/docs")
    print(f"Health: http://localhost:{port}/health")
    print(f"Test: http://localhost:{port}/ai-agent/test")
    print("=" * 70)
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )