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
- title: Activity name
- address: Full address
- geolocation: {lat, lng} if available
- priceTier: Estimated price (Free, $, $$, $$$, $$$$)
- duration: Estimated time needed (e.g., "2-3 hours")
- tags: Array of relevant tags (museum, outdoor, family, romantic, etc.)
- wheelchairAccessible: true/false based on available information
- childFriendly: true/false based on activity type
- description: Brief description

Search Results:
{search_results}

Party Type: {party_type}
Interests: {interests}
Mobility Needs: {mobility_needs}

Extract and structure the activities as JSON array.
"""

RESTAURANT_EXTRACTION_PROMPT = """Based on the restaurant search results, extract and structure restaurant information.

For each restaurant, provide:
- name: Restaurant name
- cuisine: Type of cuisine
- address: Full address
- geolocation: {lat, lng} if available
- dietaryOptions: Array of dietary options (vegetarian, vegan, gluten-free, halal, kosher)
- priceTier: Price range ($ to $$$$)
- description: Brief description highlighting dietary accommodations

Search Results:
{search_results}

Dietary Filters: {dietary_filters}
Budget: {budget}

Filter and structure only restaurants that match the dietary requirements.
Return as JSON array.
"""

DAY_BY_DAY_PROMPT = """Create a detailed day-by-day itinerary for the trip.

Trip Details:
- Location: {location}
- Dates: {start_date} to {end_date} ({nights} nights)
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
- Day number
- Morning activities (8am-12pm)
- Afternoon activities (12pm-6pm)
- Evening activities (6pm-10pm)

Consider:
- Travel time between locations
- Meal times (breakfast, lunch, dinner)
- Rest periods for families with children
- Weather conditions
- Local events
- Opening hours
- Accessibility requirements

Return as JSON array of daily plans.
"""

PACKING_CHECKLIST_PROMPT = """Generate a weather-aware packing checklist.

Trip Details:
- Location: {location}
- Dates: {start_date} to {end_date}
- Weather: {weather}
- Activities: {activities_summary}
- Party Type: {party_type}

Generate a comprehensive packing list that includes:
- Weather-appropriate clothing
- Activity-specific items
- Travel essentials
- Electronics and adapters
- Health and safety items
- Items for children (if family trip)
- Mobility aids (if needed)

Return as JSON array of items with practical recommendations.
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
