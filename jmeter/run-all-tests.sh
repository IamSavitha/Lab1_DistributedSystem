#!/bin/bash

# JMeter Performance Testing Script
# Runs all test plans with 100, 200, 300, 400, and 500 concurrent users

echo "========================================="
echo "Airbnb Prototype Performance Testing"
echo "========================================="
echo ""

# Check if JMeter is installed
if ! command -v jmeter &> /dev/null; then
    echo "❌ Error: JMeter is not installed"
    echo "Install with: brew install jmeter (macOS)"
    exit 1
fi

echo "✅ JMeter found: $(jmeter --version | head -1)"
echo ""

# Check if backend is running
if ! curl -s http://localhost:4000/health > /dev/null; then
    echo "❌ Error: Backend server is not running"
    echo "Start with: cd backend && npm start"
    exit 1
fi

echo "✅ Backend server is running"
echo ""

# User counts to test
USER_COUNTS=(100 200 300 400 500)

# Test plans
declare -A TEST_PLANS
TEST_PLANS["authentication"]="test-plans/01-authentication-test.jmx"
TEST_PLANS["property-search"]="test-plans/02-property-search-test.jmx"
TEST_PLANS["booking-process"]="test-plans/03-booking-process-test.jmx"

# Create results directory if it doesn't exist
mkdir -p results

echo "Starting performance tests..."
echo ""

# Run tests for each user count
for users in "${USER_COUNTS[@]}"; do
    echo "========================================="
    echo "Testing with $users concurrent users"
    echo "========================================="
    echo ""

    for test_name in "${!TEST_PLANS[@]}"; do
        test_file="${TEST_PLANS[$test_name]}"
        echo "Running: $test_name ($users users)..."

        jmeter -n -t "$test_file" \
            -Jusers=$users \
            -l "results/${test_name}-${users}-users.jtl" \
            -e -o "results/${test_name}-${users}-users-report" \
            > /dev/null 2>&1

        if [ $? -eq 0 ]; then
            echo "✅ Completed: $test_name ($users users)"
        else
            echo "❌ Failed: $test_name ($users users)"
        fi

        # Brief cool-down between tests
        sleep 2
    done

    echo ""
    echo "Completed tests for $users users"
    echo ""

    # Cool-down period between user counts
    if [ $users -lt 500 ]; then
        echo "Cooling down for 10 seconds..."
        sleep 10
    fi
done

echo "========================================="
echo "All tests completed!"
echo "========================================="
echo ""
echo "Results location: results/"
echo ""
echo "View HTML reports:"
for users in "${USER_COUNTS[@]}"; do
    for test_name in "${!TEST_PLANS[@]}"; do
        echo "  - results/${test_name}-${users}-users-report/index.html"
    done
done
echo ""
echo "Summary CSV files:"
for users in "${USER_COUNTS[@]}"; do
    for test_name in "${!TEST_PLANS[@]}"; do
        echo "  - results/${test_name}-${users}-users.jtl"
    done
done
