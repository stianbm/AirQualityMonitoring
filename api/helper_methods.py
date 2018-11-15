
# Takes in a parameter dict and generates the helper text
# Make sure not to modify the variable dict!

def generate_help_message(vars):
    temp_string_pollutants = ""
    for i, x in enumerate(vars.var_dict["pollutants"]):
        temp_string_pollutants += "\t\t{0}: {1}\n".format(i, x)

    temp_string_methods = ""
    for i, x in enumerate(vars.var_dict["methods"]):
        temp_string_methods += "\t\t{0}: {1}\n".format(i, x)

    help_message = "\n" \
    "supported parameteres:\n" \
    "\ttime, location, pollutants\n\n" \
    "Time:\n" \
    "\tExpected input: <start>,<end>\n" \
    "\tUrl example: time=2016-09-24T13:14:15,2018-06-18T21-09-01\n" \
    "\tinput: {2016-09-24T13:14:15} = {<year>-<month>-<day>T<hour>:<min>:<sec>}\n" \
    "\n\tIf not defined, then default value\n" \
    "\tDefualt: start = 0, end = current time\n\n"\
    "Location:\n" \
    "\tValid values: latitude = [-90, 90]\n" \
    "\t              longitude = [-180, 180]\n" \
    "\t              episilon = <float>\n" \
    "\tExpected input: <latitude>,<longitude>\n" \
    "\t                <latitude>,<longitude>,<epsilon>\n" \
    "\t                <latitude>,<longitude>,<latitude>,<longitude>\n" \
    "\tUrl example 1: location=-78,170\n" \
    "\tUrl example 2: location=-78,170,0.1\n" \
    "\tUrl example 3: location=-78.253,170.16,23.23,-56.66553\n" \
    "\n\tIf not defined then default\n" \
    "\tdefault: all data, i.e. location=-90,-180,90,180\n" \
    "\tIf example 3 is used, then the first 2 geolocations are set as the corner of a square\n" \
    "\tand the last 2 geolocations are used for the corner diagonal to the first one\n" \
    "\tall the points inside this created square will be pulled\n" \
    "\t\t a-------------------------\n" \
    "\t\t |                        |\n" \
    "\t\t |                        |\n" \
    "\t\t |                        |\n" \
    "\t\t -------------------------b\n" \
    "Pollutants:\n" \
    "\tExpected input: <int>\n" \
    "\t                <int>,<int>,...<int>\n" \
    "\tPollutants available:\n" \
    "" + temp_string_pollutants +\
    "\tUrl example: pollutants=1,2\n" \
    "\n\tIf not defined then default\n" \
    "\t\tDefault: all pollutants i.e. pollutants=" + ",".join([str(x) for x in range(len(vars.var_dict["pollutants"]))]) + "\n" \
    "\n" \
    "Methods:\n"\
    "\tExpected input: <int>\n"\
    "\t                <int>,<int>,...<int>\n"\
    "\tMethods available:\n"\
    ""+ temp_string_methods +"\n"\
    "\tUrl example: methods=0,1\n"\
    "\n"\
    "\tIf not defined then default\n"\
    "\t\tDefault: no methods applied\n"\
    "Sort:\n"\
    "\tYet to be implemented\n"
    return help_message

