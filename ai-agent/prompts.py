"""
Prompt templates for LangChain AI Agent
"""

TRAVEL_PLANNER_SYSTEM_PROMPT = """You are an expert AI travel concierge assistant specializing in creating personalized travel itineraries.

Your role is to:
1. Analyze the traveler's booking context (location, dates, party type)
2. Consider their preferences (budget, interests, dietary restrictions, mobility needs)
3. Use real-time local information (POIs, restaurants, weather, events)
4. Generate a comprehensive, day-by-day travel plan

Guidelines:
- Create realistic, achievable daily schedules
- Consider travel time between locations
- Balance activities with rest time
- Account for meal times
- Suggest appropriate clothing based on weather
- Flag wheelchair-accessible and child-friendly activities
- Filter restaurants by dietary requirements
- Include local events happening during the stay
- Provide practical tips and recommendations

Output Format:
Generate a structured JSON response with:
1. dayByDayPlan: Array of daily plans with morning/afternoon/evening activities
2. activities: Detailed activity cards with all required information
3. restaurants: Restaurant recommendations with dietary options
4. packingChecklist: Weather-aware packing list
5. localContext: Weather, events, and transportation tips
"""

ACTIVITY_EXTRACTION_PROMPT = """Based on the POI search results, extract and structure activity information.

For each activity, provide:
- name: Activity name
- address: Full address (or "Address not available")
- estimatedDuration: Estimated time needed (e.g., "2-3 hours")
- cost: Estimated price tier (Free, $, $$, $$$, $$$$)
- description: Brief description
- tags: Array of relevant tags (museum, outdoor, family, romantic, culture, food, nature, adventure, etc.)
- wheelchairAccessible: true/false/unknown based on available information
- childFriendly: true/false/unknown based on activity type

Note: Do NOT include geolocation field if coordinates are not available.

Search Results:
{search_results}

Party Type: {party_type}
Interests: {interests}
Mobility Needs: {mobility_needs}

Extract and structure the activities as JSON array. Return valid JSON only.

Example format:
[
  {{
    "name": "Museum of Modern Art",
    "address": "123 Main St",
    "estimatedDuration": "2-3 hours",
    "cost": "$$",
    "description": "World-class art museum",
    "tags": ["museum", "culture", "indoor"],
    "wheelchairAccessible": true,
    "childFriendly": true
  }}
]
"""

RESTAURANT_EXTRACTION_PROMPT = """Based on the restaurant search results, extract and structure restaurant information.

For each restaurant, provide:
- name: Restaurant name
- cuisine: Type of cuisine
- address: Full address (or "Address not available")
- priceRange: Price range ($ to $$$$)
- dietaryOptions: Array of dietary options (vegetarian, vegan, gluten-free, halal, kosher, none)
- description: Brief description highlighting dietary accommodations and ambiance

Note: Do NOT include geolocation field if coordinates are not available.

Search Results:
{search_results}

Dietary Filters: {dietary_filters}
Budget: {budget}

Filter and prioritize restaurants that match the dietary requirements and budget.
Return as valid JSON array only.

Example format:
[
  {{
    "name": "Green Leaf Bistro",
    "cuisine": "Contemporary Vegetarian",
    "address": "456 Oak Ave",
    "priceRange": "$$",
    "dietaryOptions": ["vegetarian", "vegan", "gluten-free"],
    "description": "Farm-to-table vegetarian restaurant with vegan options"
  }}
]
"""

DAY_BY_DAY_PROMPT = """Create a detailed day-by-day itinerary for the trip.

Trip Details:
- Location: {location}
- Start Date: {start_date}
- End Date: {end_date}
- Duration: {nights} nights
- Party Type: {party_type}
- Number of Guests: {guests}

Available Activities:
{activities}

Available Restaurants:
{restaurants}

Weather:
{weather}

Local Events:
{events}

User Preferences:
- Budget: {budget}
- Interests: {interests}
- Dietary Restrictions: {dietary_filters}
- Mobility Needs: {mobility_needs}

User Query (free text):
{user_query}

Create a day-by-day plan with:
- day: Day number (1, 2, 3, etc.)
- date: Date in YYYY-MM-DD format
- morning: Morning activities (8am-12pm) with specific recommendations
- afternoon: Afternoon activities (12pm-6pm) with lunch and sightseeing
- evening: Evening activities (6pm-10pm) with dinner recommendations

Consider:
- Travel time between locations
- Meal times (breakfast, lunch, dinner)
- Rest periods for families with children
- Weather conditions
- Local events
- Opening hours
- Accessibility requirements

Return as valid JSON array only.

Example format:
[
  {{
    "day": 1,
    "date": "2025-11-17",
    "morning": "Start with breakfast at Green Leaf Bistro, then visit Museum of Modern Art",
    "afternoon": "Lunch at downtown cafe, explore historic district",
    "evening": "Dinner at waterfront restaurant, evening stroll"
  }}
]
"""

PACKING_CHECKLIST_PROMPT = """Generate a weather-aware packing checklist.

Trip Details:
- Location: {location}
- Start Date: {start_date}
- End Date: {end_date}
- Weather: {weather}
- Activities: {activities}
- Party Type: {party_type}
- Mobility Needs: {mobility_needs}

Generate a comprehensive packing list that includes:
- Weather-appropriate clothing (based on temperature and conditions)
- Activity-specific items (based on planned activities)
- Travel essentials
- Electronics and adapters
- Health and safety items
- Items for children (if family trip)
- Mobility aids (if needed)

Return as JSON array of strings with practical recommendations.

Example format:
[
  "Comfortable walking shoes",
  "Light jacket (temperatures 60-70°F)",
  "Umbrella or rain jacket",
  "Sunscreen and sunglasses",
  "Camera or smartphone",
  "Reusable water bottle"
]
"""

def format_search_results(results: list, max_length: int = 3000) -> str:
    """Format search results for prompt inclusion"""
    formatted = []
    for idx, result in enumerate(results[:10], 1):  # Limit to 10 results
        formatted.append(f"{idx}. {result.get('title', 'N/A')}")
        formatted.append(f"   URL: {result.get('url', 'N/A')}")
        content = result.get('content', '')[:200]  # Limit content length
        formatted.append(f"   Summary: {content}...")
        formatted.append("")
    
    text = "\n".join(formatted)
    return text[:max_length]  # Ensure we don't exceed token limits


def format_activities_summary(activities: list) -> str:
    """Format activities for packing checklist prompt"""
    if not activities:
        return "General sightseeing and leisure"
    
    activity_types = [act.get('tags', []) for act in activities]
    flat_tags = [tag for tags in activity_types for tag in tags]
    unique_tags = list(set(flat_tags))
    
    return ", ".join(unique_tags[:10])  # Top 10 unique activity types
