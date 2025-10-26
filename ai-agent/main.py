 
Main · PY
Copy

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

# Initialize FastAPI app
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
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic Models for Request/Response

class BookingDates(BaseModel):
    startDate: str = Field(..., description="Check-in date in YYYY-MM-DD format")
    endDate: str = Field(..., description="Check-out date in YYYY-MM-DD format")


class BookingContext(BaseModel):
    bookingId: Optional[int] = Field(None, description="Optional booking ID to fetch from database")
    propertyId: Optional[int] = Field(None, description="Optional property ID")
    location: str = Field(..., description="Destination city or location")
    dates: BookingDates = Field(..., description="Travel dates")
    partyType: str = Field(default="solo", description="Type of travel party: solo, couple, family, friends")
    guests: int = Field(default=1, description="Number of guests")


class TravelPreferences(BaseModel):
    budget: str = Field(default="medium", description="Budget level: low, medium, high")
    interests: List[str] = Field(default=[], description="List of interests: museums, food, nature, adventure, etc.")
    mobilityNeeds: List[str] = Field(default=[], description="Mobility requirements: wheelchair, limited-mobility, etc.")
    dietaryFilters: List[str] = Field(default=[], description="Dietary restrictions: vegetarian, vegan, gluten-free, halal, kosher")


class TravelPlanRequest(BaseModel):
    query: str = Field(..., description="Free-text query from user describing their needs")
    bookingContext: BookingContext = Field(..., description="Booking and trip context")
    preferences: TravelPreferences = Field(..., description="User preferences and requirements")

    class Config:
        schema_extra = {
            "example": {
                "query": "We're visiting Paris for 3 days with my family. We love museums and good food. We're vegetarian and have two kids.",
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


class DayPlan(BaseModel):
    day: int
    morning: str
    afternoon: str
    evening: str


class Activity(BaseModel):
    title: str
    address: str
    geolocation: Optional[Dict[str, float]] = None
    priceTier: str
    duration: str
    tags: List[str]
    wheelchairAccessible: bool
    childFriendly: bool
    description: str


class Restaurant(BaseModel):
    name: str
    cuisine: str
    address: str
    geolocation: Optional[Dict[str, float]] = None
    dietaryOptions: List[str]
    priceTier: str
    description: str


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
    db_status = database.test_connection()
    
    return {
        "status": "healthy" if db_status else "degraded",
        "database": "connected" if db_status else "disconnected",
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
    5. Returns structured travel plan with activities, restaurants, and packing list
    
    Returns:
    - dayByDayPlan: Array of daily plans with morning/afternoon/evening activities
    - activities: Activity cards with details, accessibility flags, and tags
    - restaurants: Restaurant recommendations filtered by dietary needs
    - packingChecklist: Weather-aware packing list
    - localContext: Weather, events, and transportation information
    """
    try:
        print(f"\n{'='*60}")
        print(f"Received travel plan request")
        print(f"Query: {request.query[:100]}...")
        print(f"Location: {request.bookingContext.location}")
        print(f"Dates: {request.bookingContext.dates.startDate} to {request.bookingContext.dates.endDate}")
        print(f"{'='*60}\n")
        
        # Convert Pydantic models to dictionaries
        booking_context = request.bookingContext.dict()
        preferences = request.preferences.dict()
        
        # Generate travel plan using AI agent
        travel_plan = agent.create_travel_plan(
            query=request.query,
            booking_context=booking_context,
            preferences=preferences
        )
        
        print(f"\n{'='*60}")
        print(f"Travel plan generated successfully")
        print(f"Days: {len(travel_plan['dayByDayPlan'])}")
        print(f"Activities: {len(travel_plan['activities'])}")
        print(f"Restaurants: {len(travel_plan['restaurants'])}")
        print(f"Packing items: {len(travel_plan['packingChecklist'])}")
        print(f"{'='*60}\n")
        
        return travel_plan
        
    except Exception as e:
        print(f"\nError generating travel plan: {e}\n")
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "message": "Failed to generate travel plan",
                "error": str(e)
            }
        )


@app.get("/booking/{booking_id}")
async def get_booking(booking_id: int):
    """
    Get booking details from database
    
    This is a helper endpoint to test database connectivity
    """
    try:
        booking = database.get_booking_by_id(booking_id)
        
        if not booking:
            raise HTTPException(
                status_code=404,
                detail={"success": False, "message": "Booking not found"}
            )
        
        return {
            "success": True,
            "booking": booking
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "message": "Failed to fetch booking",
                "error": str(e)
            }
        )


@app.get("/property/{property_id}")
async def get_property(property_id: int):
    """
    Get property details from database
    
    This is a helper endpoint to test database connectivity
    """
    try:
        property_data = database.get_property_by_id(property_id)
        
        if not property_data:
            raise HTTPException(
                status_code=404,
                detail={"success": False, "message": "Property not found"}
            )
        
        return {
            "success": True,
            "property": property_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "message": "Failed to fetch property",
                "error": str(e)
            }
        )


# Startup event
@app.on_event("startup")
async def startup_event():
    """Run on server startup"""
    print("\n" + "="*60)
    print("AI Travel Concierge Agent Starting...")
    print("="*60)
    print(f"Environment: {os.getenv('API_ENV', 'development')}")
    print(f"Port: {os.getenv('API_PORT', 8000)}")
    print(f"CORS Origins: {os.getenv('CORS_ORIGINS', 'http://localhost:3000')}")
    
    # Test database connection
    db_connected = database.test_connection()
    if db_connected:
        print("Database: Connected")
    else:
        print("Database: Not connected (some features may not work)")
    
    # Check API keys
    openai_key = os.getenv("OPENAI_API_KEY")
    tavily_key = os.getenv("TAVILY_API_KEY")
    
    if openai_key and openai_key.startswith("sk-"):
        print("OpenAI API: Configured")
    else:
        print("OpenAI API: Not configured")
    
    if tavily_key and tavily_key.startswith("tvly-"):
        print("Tavily API: Configured")
    else:
        print("Tavily API: Not configured")
    
    print("="*60)
    print("API Documentation: http://localhost:8000/docs")
    print("ReDoc: http://localhost:8000/redoc")
    print("="*60 + "\n")


# Run server
if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host=os.getenv("API_HOST", "0.0.0.0"),
        port=int(os.getenv("API_PORT", 8000)),
        reload=True if os.getenv("API_ENV") == "development" else False
    )