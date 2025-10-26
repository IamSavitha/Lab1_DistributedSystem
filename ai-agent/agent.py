"""
LangChain AI Agent for Travel Planning
Uses GPT-4 to generate personalized travel itineraries
"""

import os
import json
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from dotenv import load_dotenv

from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate
from langchain.schema import HumanMessage, SystemMessage

import database
import tavily_search
from prompts import (
    TRAVEL_PLANNER_SYSTEM_PROMPT,
    ACTIVITY_EXTRACTION_PROMPT,
    RESTAURANT_EXTRACTION_PROMPT,
    DAY_BY_DAY_PROMPT,
    PACKING_CHECKLIST_PROMPT,
    format_search_results,
    format_activities_summary
)

load_dotenv()

# Initialize LLM
# Using GPT-4 for best quality. Change to "gpt-3.5-turbo" for lower cost.
llm = ChatOpenAI(
    model="gpt-3.5-turbo,  
    temperature=0.7,
    openai_api_key=os.getenv("OPENAI_API_KEY")
)


def extract_activities(
    search_results: List[Dict], 
    party_type: str, 
    interests: List[str],
    mobility_needs: List[str]
) -> List[Dict[str, Any]]:
    """
    Extract and structure activities from Tavily search results
    """
    try:
        formatted_results = format_search_results(search_results)
        
        prompt = ACTIVITY_EXTRACTION_PROMPT.format(
            search_results=formatted_results,
            party_type=party_type,
            interests=", ".join(interests) if interests else "general",
            mobility_needs=", ".join(mobility_needs) if mobility_needs else "none"
        )
        
        messages = [
            SystemMessage(content="You are a travel data extraction expert. Return only valid JSON."),
            HumanMessage(content=prompt)
        ]
        
        response = llm.invoke(messages)
        
        # Parse JSON response
        try:
            activities = json.loads(response.content)
            return activities if isinstance(activities, list) else []
        except json.JSONDecodeError:
            # If LLM doesn't return valid JSON, create basic structure
            return create_fallback_activities(search_results, party_type)
            
    except Exception as e:
        print(f"Error extracting activities: {e}")
        return create_fallback_activities(search_results, party_type)


def extract_restaurants(
    search_results: List[Dict],
    dietary_filters: List[str],
    budget: str
) -> List[Dict[str, Any]]:
    """
    Extract and structure restaurants from Tavily search results
    """
    try:
        formatted_results = format_search_results(search_results)
        
        prompt = RESTAURANT_EXTRACTION_PROMPT.format(
            search_results=formatted_results,
            dietary_filters=", ".join(dietary_filters) if dietary_filters else "none",
            budget=budget
        )
        
        messages = [
            SystemMessage(content="You are a restaurant data extraction expert. Return only valid JSON."),
            HumanMessage(content=prompt)
        ]
        
        response = llm.invoke(messages)
        
        try:
            restaurants = json.loads(response.content)
            return restaurants if isinstance(restaurants, list) else []
        except json.JSONDecodeError:
            return create_fallback_restaurants(search_results, dietary_filters)
            
    except Exception as e:
        print(f"Error extracting restaurants: {e}")
        return create_fallback_restaurants(search_results, dietary_filters)


def generate_day_by_day_plan(
    location: str,
    dates: Dict[str, str],
    guests: int,
    party_type: str,
    activities: List[Dict],
    restaurants: List[Dict],
    weather: Dict,
    events: List[Dict],
    preferences: Dict[str, Any],
    user_query: str
) -> List[Dict[str, Any]]:
    """
    Generate day-by-day travel itinerary
    """
    try:
        start_date = datetime.strptime(dates["startDate"], "%Y-%m-%d")
        end_date = datetime.strptime(dates["endDate"], "%Y-%m-%d")
        nights = (end_date - start_date).days
        
        prompt = DAY_BY_DAY_PROMPT.format(
            location=location,
            start_date=dates["startDate"],
            end_date=dates["endDate"],
            nights=nights,
            party_type=party_type,
            guests=guests,
            activities=json.dumps(activities[:15], indent=2),  # Limit to avoid token limit
            restaurants=json.dumps(restaurants[:10], indent=2),
            weather=json.dumps(weather, indent=2),
            events=format_search_results(events),
            budget=preferences.get("budget", "medium"),
            interests=", ".join(preferences.get("interests", [])),
            dietary_filters=", ".join(preferences.get("dietaryFilters", [])),
            mobility_needs=", ".join(preferences.get("mobilityNeeds", [])),
            user_query=user_query
        )
        
        messages = [
            SystemMessage(content=TRAVEL_PLANNER_SYSTEM_PROMPT),
            HumanMessage(content=prompt)
        ]
        
        response = llm.invoke(messages)
        
        try:
            day_plan = json.loads(response.content)
            return day_plan if isinstance(day_plan, list) else []
        except json.JSONDecodeError:
            return create_fallback_day_plan(nights, location, party_type)
            
    except Exception as e:
        print(f"Error generating day plan: {e}")
        return create_fallback_day_plan(3, location, party_type)


def generate_packing_checklist(
    location: str,
    dates: Dict[str, str],
    weather: Dict,
    activities: List[Dict],
    party_type: str,
    mobility_needs: List[str]
) -> List[str]:
    """
    Generate weather-aware packing checklist
    """
    try:
        activities_summary = format_activities_summary(activities)
        
        prompt = PACKING_CHECKLIST_PROMPT.format(
            location=location,
            start_date=dates["startDate"],
            end_date=dates["endDate"],
            weather=json.dumps(weather, indent=2),
            activities_summary=activities_summary,
            party_type=party_type
        )
        
        messages = [
            SystemMessage(content="You are a travel packing expert. Return a JSON array of packing items."),
            HumanMessage(content=prompt)
        ]
        
        response = llm.invoke(messages)
        
        try:
            checklist = json.loads(response.content)
            return checklist if isinstance(checklist, list) else create_fallback_checklist(party_type)
        except json.JSONDecodeError:
            return create_fallback_checklist(party_type)
            
    except Exception as e:
        print(f"Error generating packing checklist: {e}")
        return create_fallback_checklist(party_type)


def create_travel_plan(
    query: str,
    booking_context: Dict[str, Any],
    preferences: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Main function to create complete travel plan
    
    Args:
        query: Free-text user query
        booking_context: Booking details (location, dates, partyType, bookingId, propertyId)
        preferences: User preferences (budget, interests, mobilityNeeds, dietaryFilters)
        
    Returns:
        Complete travel plan with all components
    """
    print(f"Starting travel plan generation...")
    print(f"Location: {booking_context.get('location')}")
    print(f"Dates: {booking_context.get('dates')}")
    
    # Extract context
    location = booking_context.get("location", "Unknown")
    dates = booking_context.get("dates", {})
    party_type = booking_context.get("partyType", "solo")
    guests = booking_context.get("guests", 1)
    
    # Get booking details from database if bookingId provided
    booking_id = booking_context.get("bookingId")
    if booking_id:
        print(f"Fetching booking details from database: ID {booking_id}")
        booking_details = database.get_booking_by_id(booking_id)
        if booking_details:
            location = booking_details.get("city", location)
            dates = {
                "startDate": booking_details.get("start_date", ""),
                "endDate": booking_details.get("end_date", "")
            }
            guests = booking_details.get("guests", guests)
            print(f"Retrieved booking: {location}, {dates}")
    
    # Perform comprehensive web search
    print(f"Performing Tavily search...")
    search_results = tavily_search.comprehensive_search(location, dates, preferences)
    
    # Extract and structure data
    print(f"Extracting activities...")
    activities = extract_activities(
        search_results["pois"],
        party_type,
        preferences.get("interests", []),
        preferences.get("mobilityNeeds", [])
    )
    
    print(f"Extracting restaurants...")
    restaurants = extract_restaurants(
        search_results["restaurants"],
        preferences.get("dietaryFilters", []),
        preferences.get("budget", "medium")
    )
    
    # Generate itinerary
    print(f"Generating day-by-day plan...")
    day_by_day_plan = generate_day_by_day_plan(
        location=location,
        dates=dates,
        guests=guests,
        party_type=party_type,
        activities=activities,
        restaurants=restaurants,
        weather=search_results["weather"],
        events=search_results["events"],
        preferences=preferences,
        user_query=query
    )
    
    # Generate packing list
    print(f"Generating packing checklist...")
    packing_checklist = generate_packing_checklist(
        location=location,
        dates=dates,
        weather=search_results["weather"],
        activities=activities,
        party_type=party_type,
        mobility_needs=preferences.get("mobilityNeeds", [])
    )
    
    # Compile final response
    response = {
        "success": True,
        "dayByDayPlan": day_by_day_plan,
        "activities": activities[:20],  # Limit to top 20
        "restaurants": restaurants[:15],  # Limit to top 15
        "packingChecklist": packing_checklist,
        "localContext": {
            "weather": search_results["weather"],
            "events": [
                {
                    "name": event.get("title", "Local Event"),
                    "url": event.get("url", ""),
                    "description": event.get("content", "")[:200]
                }
                for event in search_results["events"][:5]
            ],
            "transportation": {
                "recommendation": f"Research public transportation options in {location}. Consider getting a local transit pass for convenience."
            }
        }
    }
    
    print(f"Travel plan generated successfully!")
    return response


# Fallback functions for when LLM fails to return proper JSON

def create_fallback_activities(search_results: List[Dict], party_type: str) -> List[Dict]:
    """Create basic activity structure from search results"""
    activities = []
    for result in search_results[:10]:
        activities.append({
            "title": result.get("title", "Activity"),
            "address": "Address not available",
            "priceTier": "Information not available",
            "duration": "2-3 hours",
            "tags": ["sightseeing"],
            "wheelchairAccessible": True,
            "childFriendly": party_type == "family",
            "description": result.get("content", "")[:150]
        })
    return activities


def create_fallback_restaurants(search_results: List[Dict], dietary_filters: List[str]) -> List[Dict]:
    """Create basic restaurant structure from search results"""
    restaurants = []
    for result in search_results[:8]:
        restaurants.append({
            "name": result.get("title", "Restaurant"),
            "cuisine": "Various",
            "address": "Address not available",
            "dietaryOptions": dietary_filters,
            "priceTier": "$$",
            "description": result.get("content", "")[:150]
        })
    return restaurants


def create_fallback_day_plan(nights: int, location: str, party_type: str) -> List[Dict]:
    """Create basic day-by-day plan"""
    plans = []
    for day in range(1, nights + 1):
        plans.append({
            "day": day,
            "morning": f"Morning exploration of {location}. Visit local attractions and landmarks.",
            "afternoon": f"Afternoon activities and lunch at a local restaurant.",
            "evening": f"Evening leisure time and dinner. Explore the neighborhood."
        })
    return plans


def create_fallback_checklist(party_type: str) -> List[str]:
    """Create basic packing checklist"""
    checklist = [
        "Comfortable walking shoes",
        "Weather-appropriate clothing",
        "Light jacket or sweater",
        "Sunscreen and sunglasses",
        "Reusable water bottle",
        "Phone charger and power adapter",
        "Camera or smartphone",
        "Travel documents and ID",
        "Medications and first aid kit",
        "Hand sanitizer and masks"
    ]
    
    if party_type == "family":
        checklist.extend([
            "Snacks for kids",
            "Entertainment for children",
            "Stroller or baby carrier (if needed)"
        ])
    
    return checklist


# Test function
if __name__ == "__main__":
    test_plan = create_travel_plan(
        query="We're visiting Paris with two kids, we love museums and are vegetarian",
        booking_context={
            "location": "Paris",
            "dates": {"startDate": "2025-11-01", "endDate": "2025-11-05"},
            "partyType": "family",
            "guests": 4
        },
        preferences={
            "budget": "medium",
            "interests": ["museums", "food"],
            "mobilityNeeds": [],
            "dietaryFilters": ["vegetarian"]
        }
    )
    
    print(json.dumps(test_plan, indent=2))