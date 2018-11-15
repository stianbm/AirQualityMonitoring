#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Unit tests for the api get endpoint. To be used with the test utility pytest
Test functions seems to be evaluated from top to bottom
Only functions starting with test are evaluated
"""
import unittest, sys, random
import testutils
import pytest, warnings
import requests
import re

sys.path.append("../api")
import api_server

# Testing variables
api_base = "http://127.0.0.1:5000/fetch"
endpoint_test_iterations = 10
max_random_string_length  = 20

number_of_parameters = 5

correct_input_regex = {
    1: r"""
    ^((\d{4})-(\d{2})-(\d{2})T(([0-1][0-9])|2[0-3]):([0-5][0-9]):([0-5][0-9]))
    ((,(\d{4})-(\d{2})-(\d{2})T(([0-1][0-9])|2[0-3]):([0-5][0-9]):([0-5][0-9])))?$
    """, # time
    2: r"""
    ^(([1-9][0-9]*(\.[0-9]+)?),([1-9][0-9]*(\.[0-9]+)?))
    (,[1-9][0-9]*(\.[1-9][0-9]*)?,([1-9][0-9]*(\.[1-9][0-9]*)?))?$"
    """, # location
    3: r"^([1-9][0-9]*)(,[1-9][0-9]*)*$", # pollutants
    4: r"^([1-9][0-9]*)(,[1-9][0-9]*)*$", # methods
    5: r"^([1-9][0-9]*)(,[1-9][0-9]*)*$" # sort
}

parameters_dict = {
    1: "time",
    2: "location",
    3: "pollutants",
    4: "methods",
    5: "sort"
}

parameter_sample_value = {
    1: "2015-09-09T23:09:11,2017-09-09T23:09:11",
    2: "69.67402,18.97674",
    3: "1,2",
    4: "1",
    5: "1"
}

correct_input_examples = [
    {
        "location": "69,18",
        "time": "2015-09-09T23:09:11,2017-09-09T23:09:11"
    },
    {
        "location": "69.67402,18.97674",
        "time": "2015-09-09T23:09:11,2017-09-09T23:09:11",
        "pollutants": "1,2,3",
        "methods": "0,1",
        "sort": "1"
    },
    {
        "location": "69,110.97674,10.0,29.100",
        "time": "2015-09-09T23:09:11,2017-09-09T23:09:11",
        "pollutants": "1,2,352",
        "methods": "0",
        "sort": "0"
    },
    {
        "location": "23.67402523,80.97674",
        "time": "2015-09-09T23:09:11,2017-09-09T23:09:11",
        "pollutants": "1,2,352",
        "methods": "0,0,1",
        "sort": "0,0"
    }
]

wrong_input_examples = {
    "param_errors": [
        {
            "loction": "69.67402,18.97674",
            "time": "2015-09-09T23:09:11,2017-09-09T23:09:11",
            "pollutants": "1,2,3",
            "methoods": "0",
            "sort": "0"
        },
        {
            "locationn": "69.67402523,110.97674",
            "time": "2015-09-09T23:09:11,2017-09-09T23:09:11",
            "pollutantss": "1,2,352",
            "methods": "0,0",
            "sort": "0"
        },
        {
            "location": "69.67402523,110.97674,42,10",
            "tim": "2015-09-09T23:09:11,2017-09-09T23:09:11",
            "": "1",
            "methods": "311",
            "sort": "0"
        }
    ],
    "value_errors": [
        {
            "location": "69.67402,18.97674",
            "time": "2015-09-09T23:09,2017-09-09T23:09:11",
            "pollutants": "1,2,3,",
            "methods": "0",
            "sort": "0"
        },
        {
            "location": "69.67402523,110.97674",
            "time": "2015-09-09T23:09:11,2017-09-09T23:09:11",
            "pollutants": "1,2,352",
            "methods": "abc",
            "sort": "def"
        },
        {
            "location": ",110.97674,42,10",
            "time": "2015-0-09T23:09:11,2017-09-09T23:09:11",
            "pollutants": "1",
            "methods": "0",
            "sort": "0"
        }
    ]
}

wrong_input_expected_errors = {
    "param_errors": [
        ["loction", "methoods"], # param error: loction, methood
        ["locationn","pollutantss"], # param error: locationn, pollutantss
        ["tim"," "]  # param error: tim,
    ],
    "value_errors": [
        ["time", "pollutants"], # input error: time, pollutants
        ["methods", "sort"], # input error: methods, sort
        ["location"]  # input error: location
    ]
}

# Authentication and input examples that should work
def try_correct_input():
    for i in range(len(correct_input_examples)):
        response = requests.get(url=api_base, params=correct_input_examples[i])
        print("We are at correct example nr " + str(i))
        assert(response.status_code == 200)
    pass

# Try varying numbers of parameters, and in different order
# These should all be ok, and return status code 200
def try_correct_input_scrambled():

    # Shuffles the array
    random_list = []
    temp = [x+1 for x in range(number_of_parameters)]
    for i in range(number_of_parameters):
        random_list.append(temp.pop(int(random.random()*(len(temp)))))

    query = api_base+"?"

    random_length = int(random.random()*number_of_parameters)
    for i in range(random_length):
        query += parameters_dict[random_list[i]]
        query += "="
        query += parameter_sample_value[random_list[i]]
        query += "&"

    # Strip the trailing ampersand
    query=query[:len(query)-1]
    response = requests.get(url=query)
    assert(response.status_code == 200)

# Try repeated random parameters, up to double the number of usual params. It should work
def try_correct_input_repeated():
    random_list = [int(random.random()*number_of_parameters)+1 for x in range(number_of_parameters*2)]
    query = api_base+"?"

    random_length = int(random.random()*number_of_parameters)
    print(random_list)
    for i in range(random_length):
        query += parameters_dict[random_list[i]]
        query += "="
        query += parameter_sample_value[random_list[i]]
        query += "&"

    # Strip the trailing ampersand
    query=query[:len(query)-1]

    response = requests.get(url=query)
    assert(response.status_code == 200)

# Try correct parameters with fully random values. These should generaly not return 200
# On a success, see if the generated input happened to be something that should succeed. If not, fail the test
# Thr random characters used are alhapnumerical
def try_correct_params_random_values():
    query = api_base + "?"
    no_params_to_use = int(random.random()*number_of_parameters+1)

    for i in range(1, no_params_to_use):
        random_length = int(random.random()*max_random_string_length)
        argument = testutils.generate_random_string(random_length)
        query += parameters_dict[i] + "=" + argument + "&"

    # Strip the trailing ampersand
    query=query[:len(query)-1]

    #Try the query, and check response
    response = requests.get(url=query)
    print(response.status_code)

# Just a long random string really. This should not return 200, but if it does, validate input to check
# Draws characters from full encoding. Use for stress test.
# NOT USABLE. Need to fix the set of all legal utf-8 code points
def try_random_nonsense():
    query = api_base + "?"

def try_incorrect_input_params():
    # First we try wrong parameter names
    param_error_data = wrong_input_examples["param_errors"]
    expected_param_error = wrong_input_expected_errors["param_errors"]

    # We iterate over each prepared case
    for i in range(len(param_error_data)):
        # For each iteration, we need to build the url
        query = api_base + "?"
        # The param_error_data dictionary contains
        for param in param_error_data[i]:
            segment = str(param)
            segment += "="
            segment += param_error_data[i][param]
            segment += "&"
            query += segment

        # Trim trailing ampersand
        query = query[:len(query)-1]
        print(query)
        response = requests.get(url=query)
        response_errors = response.text

        # This is a messy way of splitting the input, but it works. Feel free to replace!
        # It splits on different delimiters, with the notable exception of a comma following
        # a whitespace. This is to shield the empty param response
        response_errors = re.split(",| |\n|\"|:", response.text)
        relevant_responses = []
        empty_counter = 0
        for string in response_errors:
            if len(string) == 0:
                empty_counter += 1
            else:
                empty_counter = 0

            # The special case of the empty parameter
            if empty_counter  == 3:
                relevant_responses += " "

            if len(string) > 0 and string != "param" and string != "error":
                relevant_responses += [string]

        response_errors = relevant_responses

        # The server should return a 400 status code + a text message describing what was wrong
        assert(response.status_code == 400)

# For all the errors, see if they are in the expected erors
        # Each error should only be encountered once, so we remove them from the list
        for param in expected_param_error[i]:
            assert(param in response_errors)
            response_errors.remove(param)

        # Finally, see if we found all errors
        assert(len(response_errors) == 0)


def try_incorrect_input_values():
    value_error_data = wrong_input_examples["value_errors"]
    expected_value_error = wrong_input_expected_errors["value_errors"]

    # Send all the requests to the server, one by one
    for i in range(len(value_error_data)):
        # For each iteration, we need to build the url
        query = api_base + "?"
        # The param_error_data dictionary contains
        for param in value_error_data[i]:
            segment = str(param)
            segment += "="
            segment += value_error_data[i][param]
            segment += "&"
            query += segment

        # Trim trailing ampersand
        query = query[:len(query)-1]
        #print(query)
        response = requests.get(url=query)

        # We should get 400 status code in return
        assert(response.status_code == 400)

        response_errors = re.split(",| |\n|\"|:", response.text)
        relevant_responses = []
        empty_counter = 0

        for string in response_errors:
            if len(string) == 0:
                empty_counter += 1
            else:
                empty_counter = 0

            # The special case of the empty parameter
            if empty_counter  == 3:
                relevant_responses += " "

            if len(string) > 0 and string != "input" and string != "error":
                relevant_responses += [string]

        response_errors = relevant_responses

        # See if we found all the errors we were looking for, and no others
        for value in expected_value_error[i]:
            assert(value in response_errors)
            response_errors.remove(value)

        print("remaining response errors: " + str(response_errors))

        # The response errors list should now be empty, if not it means we got errors
        # we were not expecting
        assert(len(response_errors) == 0)

# Make sure the test framework is set up properly
def test_framework():
    assert((2+2)-1 == 3)

# Test the api endpoint with fixed inputs
def test_correct_input():
    # First try authentication + a set of pre-determined queries that should be legal
    try_correct_input()

    # Several occurences of otherwise correct paramters and values should not crash the server
    try_correct_input_repeated()

    # The order of parameters should not be important
    try_correct_input_scrambled()

def test_incorrect_input():
    # Try different sort of inncorrect input, and check if the response is correct
    try_incorrect_input_params()
    try_incorrect_input_values()

# Stress test the endpoint with randomized input
"""
def test_endpoint_input_randomized():
     # First a set of correct inputs in varying order
    for i in range(endpoint_test_iterations):
        try_correct_input_scrambled()

    # Then correct inputs repeated multiple times in random order
    for i in range(endpoint_test_iterations):
        try_correct_input_repeated()
"""
