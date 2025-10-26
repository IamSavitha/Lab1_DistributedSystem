"""
Tavily Search module for AI Agent
Performs web searches for POIs, restaurants, weather, and local events
"""

import os
from typing import List, Dict, Any, Optional
from tavily import TavilyClient
from dotenv import load_dotenv

load_dotenv()

# Initialize Tavily client
tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))


def search_pois(location: str, interests: List[str] = None, max_results: int = 10) -> List[Dict[str, Any]]:
    """
    Search for Points of Interest in a location
    
    Args:
        location: City or destination name
        interests: List of interest keywords (museums, food, nature, etc.)
        max_results: Maximum number of results
        
    Returns:
        List of POI results
    """
    try:
        # Build search query
        interest_str = " ".join(interests) if interests else "tourist attractions"
        query = f"top {interest_str} things to do in {location} attractions points of interest"
        
        response = tavily_client.search(
            query=query,
            max_results=max_results,
            search_depth="advanced",
            include_domains=["tripadvisor.com", "lonelyplanet.com", "timeout.com", "viator.com"]
        )
        
        return response.get("results", [])
        
    except Exception as e:
        print(f"Error searching POIs: {e}")
        return []


def search_restaurants(
    location: str, 
    dietary_filters: List[str] = None, 
    max_results: int = 8
) -> List[Dict[str, Any]]:
    """
    Search for restaurants with dietary filters
    
    Args:
        location: City or destination name
        dietary_filters: List of dietary restrictions (vegetarian, vegan, gluten-free, halal, kosher)
        max_results: Maximum number of results
        
    Returns:
        List of restaurant results
    """
    try:
        # Build search query with dietary filters
        dietary_str = " ".join(dietary_filters) if dietary_filters else ""
        query = f"best {dietary_str} restaurants in {location} dining food"
        
        response = tavily_client.search(
            query=query,
            max_results=max_results,
            search_depth="advanced",
            include_domains=[
                "tripadvisor.com", 
                "yelp.com", 
                "timeout.com", 
                "eater.com",
                "thefork.com",
                "happycow.net"
            ]
        )
        
        return response.get("results", [])
        
    except Exception as e:
        print(f"Error searching restaurants: {e}")
        return []


def search_weather(location: str, dates: Dict[str, str]) -> Dict[str, Any]:
    """
    Search for weather forecast
    
    Args:
        location: City or destination name
        dates: Dictionary with startDate and endDate
        
    Returns:
        Weather information
    """
    try:
        start_date = dates.get("startDate", "")
        query = f"weather forecast {location} {start_date} temperature conditions"
        
        response = tavily_client.search(
            query=query,
            max_results=3,
            search_depth="basic",
            include_domains=["weather.com", "accuweather.com", "weatherapi.com"]
        )
        
        results = response.get("results", [])
        
        # Parse weather data from results
        weather_info = {
            "temperature": "Information not available",
            "conditions": "Check local weather forecast",
            "recommendation": "Pack layers and check weather before departure",
            "raw_results": results
        }
        
        return weather_info
        
    except Exception as e:
        print(f"Error searching weather: {e}")
        return {
            "temperature": "Information not available",
            "conditions": "Unknown",
            "recommendation": "Check local weather forecast before departure"
        }


def search_local_events(location: str, dates: Dict[str, str], max_results: int = 5) -> List[Dict[str, Any]]:
    """
    Search for local events during travel dates
    
    Args:
        location: City or destination name
        dates: Dictionary with startDate and endDate
        max_results: Maximum number of results
        
    Returns:
        List of local events
    """
    try:
        start_date = dates.get("startDate", "")
        end_date = dates.get("endDate", "")
        query = f"events festivals activities in {location} {start_date} to {end_date}"
        
        response = tavily_client.search(
            query=query,
            max_results=max_results,
            search_depth="advanced"
        )
        
        return response.get("results", [])
        
    except Exception as e:
        print(f"Error searching events: {e}")
        return []


def search_accessibility_info(location: str, mobility_needs: List[str]) -> List[Dict[str, Any]]:
    """
    Search for accessibility information
    
    Args:
        location: City or destination name
        mobility_needs: List of mobility requirements (wheelchair, limited-mobility, etc.)
        
    Returns:
        List of accessibility results
    """
    try:
        if not mobility_needs:
            return []
        
        mobility_str = " ".join(mobility_needs)
        query = f"{mobility_str} accessible attractions transportation in {location}"
        
        response = tavily_client.search(
            query=query,
            max_results=5,
            search_depth="advanced"
        )
        
        return response.get("results", [])
        
    except Exception as e:
        print(f"Error searching accessibility info: {e}")
        return []


def comprehensive_search(
    location: str,
    dates: Dict[str, str],
    preferences: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Perform comprehensive search combining all categories
    
    Args:
        location: City or destination name
        dates: Dictionary with startDate and endDate
        preferences: Dictionary with interests, dietaryFilters, mobilityNeeds, budget
        
    Returns:
        Dictionary with all search results
    """
    print(f"Starting comprehensive search for {location}...")
    
    interests = preferences.get("interests", [])
    dietary_filters = preferences.get("dietaryFilters", [])
    mobility_needs = preferences.get("mobilityNeeds", [])
    
    results = {
        "pois": search_pois(location, interests, max_results=12),
        "restaurants": search_restaurants(location, dietary_filters, max_results=10),
        "weather": search_weather(location, dates),
        "events": search_local_events(location, dates, max_results=5),
        "accessibility": search_accessibility_info(location, mobility_needs) if mobility_needs else []
    }
    
    print(f"Found {len(results['pois'])} POIs, {len(results['restaurants'])} restaurants, {len(results['events'])} events")
    
    return results


# Test function
if __name__ == "__main__":
    test_results = comprehensive_search(
        location="Paris",
        dates={"startDate": "2025-11-01", "endDate": "2025-11-05"},
        preferences={
            "interests": ["museums", "food"],
            "dietaryFilters": ["vegetarian"],
            "mobilityNeeds": [],
            "budget": "medium"
        }
    )
    print(f"Test search completed: {len(test_results)} categories")
