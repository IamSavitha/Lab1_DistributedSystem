"""
Database module for AI Agent
Connects to MySQL database to retrieve booking context
"""

import os
import mysql.connector
from mysql.connector import pooling, Error
from typing import Optional, Dict, Any
from dotenv import load_dotenv

load_dotenv()

# Create connection pool
try:
    db_pool = mysql.connector.pooling.MySQLConnectionPool(
        pool_name="ai_agent_pool",
        pool_size=5,
        pool_reset_session=True,
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", 3306)),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "airbnb_db")
    )
    print("Database connection pool created successfully")
except Error as e:
    print(f"Error creating MySQL connection pool: {e}")
    db_pool = None


def get_booking_by_id(booking_id: int) -> Optional[Dict[str, Any]]:
    """
    Retrieve booking details by ID
    
    Args:
        booking_id: The booking ID
        
    Returns:
        Dictionary with booking details or None if not found
    """
    if not db_pool:
        print("Database pool not initialized")
        return None
    
    try:
        connection = db_pool.get_connection()
        cursor = connection.cursor(dictionary=True)
        
        query = """
            SELECT 
                b.id,
                b.property_id,
                b.traveler_id,
                b.start_date,
                b.end_date,
                b.guests,
                b.total_price,
                b.status,
                p.name as property_name,
                p.type as property_type,
                p.city,
                p.state,
                p.country,
                p.location,
                p.price as price_per_night,
                t.name as traveler_name,
                t.email as traveler_email,
                DATEDIFF(b.end_date, b.start_date) as nights
            FROM bookings b
            JOIN properties p ON b.property_id = p.id
            JOIN travelers t ON b.traveler_id = t.id
            WHERE b.id = %s
        """
        
        cursor.execute(query, (booking_id,))
        result = cursor.fetchone()
        
        cursor.close()
        connection.close()
        
        if result:
            # Convert date objects to strings
            if result.get('start_date'):
                result['start_date'] = result['start_date'].strftime('%Y-%m-%d')
            if result.get('end_date'):
                result['end_date'] = result['end_date'].strftime('%Y-%m-%d')
        
        return result
        
    except Error as e:
        print(f"Error fetching booking: {e}")
        return None


def get_property_by_id(property_id: int) -> Optional[Dict[str, Any]]:
    """
    Retrieve property details by ID
    
    Args:
        property_id: The property ID
        
    Returns:
        Dictionary with property details or None if not found
    """
    if not db_pool:
        print("Database pool not initialized")
        return None
    
    try:
        connection = db_pool.get_connection()
        cursor = connection.cursor(dictionary=True)
        
        query = """
            SELECT 
                id,
                owner_id,
                name,
                type,
                location,
                city,
                state,
                country,
                price,
                bedrooms,
                bathrooms,
                max_guests,
                image_url,
                description,
                amenities
            FROM properties
            WHERE id = %s
        """
        
        cursor.execute(query, (property_id,))
        result = cursor.fetchone()
        
        cursor.close()
        connection.close()
        
        return result
        
    except Error as e:
        print(f"Error fetching property: {e}")
        return None


def get_traveler_preferences(traveler_id: int) -> Optional[Dict[str, Any]]:
    """
    Retrieve traveler profile for preferences
    
    Args:
        traveler_id: The traveler ID
        
    Returns:
        Dictionary with traveler details or None if not found
    """
    if not db_pool:
        print("Database pool not initialized")
        return None
    
    try:
        connection = db_pool.get_connection()
        cursor = connection.cursor(dictionary=True)
        
        query = """
            SELECT 
                id,
                name,
                email,
                city,
                state,
                country,
                about,
                languages
            FROM travelers
            WHERE id = %s
        """
        
        cursor.execute(query, (traveler_id,))
        result = cursor.fetchone()
        
        cursor.close()
        connection.close()
        
        return result
        
    except Error as e:
        print(f"Error fetching traveler: {e}")
        return None


def test_connection() -> bool:
    """
    Test database connection
    
    Returns:
        True if connection successful, False otherwise
    """
    if not db_pool:
        return False
    
    try:
        connection = db_pool.get_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT 1")
        cursor.fetchone()
        cursor.close()
        connection.close()
        print("Database connection test successful")
        return True
    except Error as e:
        print(f"Database connection test failed: {e}")
        return False


# Test connection on module import
if __name__ == "__main__":
    test_connection()