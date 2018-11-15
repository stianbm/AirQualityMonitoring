from flask import Flask, request, Response, make_response
from flask_restful import Resource, Api
import requests, json
import datetime
from requests_toolbelt import MultipartEncoder
import math
import data_methods
import helper_methods as helpers

app = Flask(__name__)
api = Api(app)
debug = True
credentials_url = "./credentials.txt"
pollutants_url = "./configuration.txt"

# Parameters for the methods
# Grid average:
grid_cell_x = 0.001
grid_cell_y = 0.001

# IMPORTANT: elastic search by deafault limits page+size to 10000, anything beyond returns an error
# on a regular search. size = 10000  and page = 0 should be the default. To move this search window,
# adjust search parameters
pagination_start = 0
max_number_of_datapoints = 10000

# Toggle use of scrolls for really big data sets. This does incur a performance overhead though,
# should only be enabeled if you expect really big datasets from a query
# DEPRECATED: it turns out that the scroll api is not made available to us through MIC, the flag currently
# does nothing. Leaving it here as a note to future developers, as a reminder in case MIC opens up for the use
# of scrolls later
# use_scrolls = True

# @TODO make these flags toggelable via the request to the server(methods maybe?)
use_multipart = False # When true, send response as a multipart message, if it is needed
remove_dataless_points = False # When true, remove points without data values

class variables():
    # To allow for testing, which happens in a different directory,
    # the credentials location must be specified as a parameter.
    def __init__(self, credentials_url=credentials_url):
        login_file = json.loads(open(credentials_url, 'r').read())
        # set variables so that the other classes can use these.
        self.var_dict = {
            "api_url": login_file["api_url"],
            "api_key": login_file["api_key"],
            "username": login_file["login_name"],
            "password": login_file["login_password"],
            "identityId": "",
            "token": "",
            "refreshToken": "",
            "pollutants" : []
        }
        # Then the config file to enable specific methods and pollutants
        config_file = json.loads(open(pollutants_url, "r").read())
        self.var_dict["pollutants"] = config_file["pollutants"]
        self.var_dict["methods"] = config_file["methods"]

    def getAuthent(self):
        #Authenticate against MIC and store the token, refreshToken and identityId
        data = {'userName': self.var_dict["username"], 'password': self.var_dict["password"]}
        headers = {'x-api-key': self.var_dict["api_key"]}
        r = requests.post(url = self.var_dict["api_url"] + "/auth/login" , data = json.dumps(data), headers=headers)
        r_dict = json.loads(r.text)
        self.var_dict["token"] = r_dict['credentials']['token']
        self.var_dict["refreshToken"] = r_dict['credentials']['refreshToken']
        self.var_dict["identityId"] = r_dict["credentials"]["identityId"]

    def reauthent(self):
        headers = {'x-api-key': self.var_dict["api_key"]}
        data = {"refreshToken": self.var_dict["refreshToken"]}
        r = requests.post(url= self.var_dict["api_url"] + "/auth/refresh", data=json.dumps(data), headers = headers)
        r_dict = json.loads(r.text)
        self.var_dict["token"] = r_dict['credentials']['token']
        self.var_dict["refreshToken"] = r_dict['credentials']['refreshToken']
        self.var_dict["identityId"] = r_dict["credentials"]["identityId"]
        if debug: print("reauthenticated")

# The text message is generated in a helper method defined in helper_methods.py
class help_manual(Resource):
    def get(self):
        return Response(helpers.generate_help_message(vars), mimetype='text/xml')

class fetch(Resource):
    def get(self):
        if not vars.var_dict["token"]:
            # check if authenticated, if token is empty -> need to authenticate
            # The authentication can fail. If this happens, the server should handle it
            # and reauthenticate
            vars.getAuthent()
            #debugging purpose, check global var debug
            if debug: print("authenticated");

        user_url = '/users/' + vars.var_dict["username"]
        headers = {
            'Authorization': vars.var_dict["token"],
            'identityId': vars.var_dict["identityId"],
            'x-api-key': vars.var_dict["api_key"]
        }
        get_request_response = requests.get(url = vars.var_dict["api_url"] + user_url, headers = headers)

        # use request module to get the url parameters/input to a dictionary for ease of use
        params = request.args.to_dict()

        # print for debug purpose, check global var debug
        if debug: print("params: ", params);

        # call cechk_get_params() to validate the input
        new_params = check_get_params(params)
        if new_params[1] != "ok":
            #either param_error or input_error, do something with this ie return error message
            if new_params[1] == "param_error":
                return "param error: {}".format(", ".join(new_params[0])), 400
            if new_params[1] == "input_error":
                return "input error: {}".format(", ".join(new_params[0])), 400
        # valdiation = ok, therefore do the actually get-call to mic

        # data is an array of datasets small enough that should fit in a package
        # data = [[{...}], [{...}]]
        # fetch_data resolves size error recursivly, and if enabeled, utilizes scrolls
        data = fetch_data(build_payload(params), params)

        # Check for and apply methods if requested
        data = apply_methods(params, data)

        if(data != None):
            # if(len(data) == 1 or use_multipart == False):# encode single data
            return_data = []
            # We flatten the list
            for list_element in data:
                return_data.extend(list_element.values())

            # Just remove the outer list if the element count is 1
            if len(return_data) == 1:
                return_data = return_data[0]

            return_dict = {"data":return_data}
            resp = make_response(json.dumps(return_dict))
            # IMPORTANT
            resp.headers["Access-Control-Allow-Origin"] = "*"
            return resp
            """
            else: # encode mulipart message
                packets = {}
                print(len(data))
                # Fill the packets with json dumps of the dataobject, and insert into the
                # final data object
                for i in range(len(data)):
                    packets[str(i)] = json.dumps(data[i])

                multi_response = MultipartEncoder(
                    fields=packets
                )
                return Response(multi_response.to_string(), mimetype="application/json");
            """

def apply_methods(params, data):
     # If it is requested, we apply methods to the data
    if(params["methods"] != "none"):
        method_list = params["methods"].split(',')

        # We iterate over all methods given in the configuration file
        for method in method_list:
            if(vars.var_dict["methods"][int(method)] == "grid_average"):
                # First we need to define the bounding box
                x,y,area_height,area_width = (0, 0, 0, 0)
                if(params["location"] == "all"):
                    x = -90.0; y = -180.0; area_height = 180.0; area_width = 360.0;
                else:
                    coord_list = params["location"].split(",")
                    x = float(coord_list[0]); y = float(coord_list[1])

                    # Two cases: either, we have a single point with defined epsilon,
                    # or two fully defined points
                    if len(coord_list) == 3:
                        x -= coord_list[2]/2; y -= coord_list[2]/2
                        area_height = coord_list[2]; area_width = coord_list[2]

                    if len(coord_list) == 4:
                        area_height = float(coord_list[2])-x; area_width = float(coord_list[3])-y

                # The pollutants lays in params["pollutants"], but we need to translate it to names
                # The names lay in vars.var_dict["pollutants"]
                pollutants_chosen = params["pollutants"].split(",")
                chosen_pollutant_names = []
                for i in range(len(pollutants_chosen)):
                    chosen_pollutant_names.append(vars.var_dict["pollutants"][i])

                data = data_methods.average_data_points_grid(data,
                                                             grid_cell_x,
                                                             grid_cell_y,
                                                             x,
                                                             y,
                                                             area_height,
                                                             area_width,
                                                             chosen_pollutant_names)
    return data

def check_get_params(params):
    # pre-determined parameter names, if more is needed then add to defined_params
    defined_params = ["location", "time", "pollutants", "methods", "sort"]
    #check for wrong parameter names
    wrong_params = list(filter(lambda key: key not in defined_params, params.keys()))
    if debug: print("wrong params : ", wrong_params);
    if wrong_params:
        # if wrong_params != empty then one/more param(s) are written wrong/non-supported
        # return the wrong parameters and internal "param_error" message for further processing
        return wrong_params, "param_error"
    #check for wrong parameter values
    wrong_input_values = []
    for key in params.keys():
        if key == "location":
            # expected input form: "<float>,<float>" // "<float>,<float>,<float>,<float>"
            # example "123.23,23.1"
            vals = params[key].replace(",", ".").split(".")
            if list(filter(lambda val: not val.strip("-").isdigit(), vals)):
                if len(vals) != 2 and len(vals) != 3 and  len(vals) != 4:
                    wrong_input_values.append(key)
        elif key == "time":
            # expected input form: "<string>,<string>"
            # example input form: "2019-09-09T23:12:11,2018-01-01T12:12:12"
            vals = params[key].replace("T", ",").replace("-", ",").replace(":", ",").split(",")
            if list(filter(lambda values: not values.isdigit(), vals))or len(vals) != 12:
                # after replacing all non digits in input and splitting, expected 12 digits.
                # If not then missing or wrong input ie letters in input
                wrong_input_values.append(key)
        elif key == "pollutants":
            # expected input form: <int> // <int>,<int>.....,<int>
            # example input form: 1 // 1,2,5
            if list(filter(lambda val: not val.isdigit(), params[key].split(","))):
                wrong_input_values.append(key);
        elif key == "methods":
            # expected input form: <int> // <int>,<int>.....,<int>
            # example input form: 0,1
            if list(filter(lambda val: not val.isdigit(), params[key].split(","))):
                wrong_input_values.append(key);

            # The method must exist in the configuration file. The file is used to fill the
            # variable field var_dict["methods"] with an array. If a method id is longer than
            # this array, it can not exist
            else:
                method_list = params["methods"].split(",")
                for id in method_list:
                    if int(id) >= len(vars.var_dict["methods"]):
                        wrong_input_values.append(key)

        elif key == "sort":
            # expected input form: <int> // <int>,<int>.....,<int>
            # example input form: 3
            if list(filter(lambda val: not val.isdigit(), params[key].split(","))):
                wrong_input_values.append(key);
        else:
            # the code has already ensured that the keys are correct, should be impossible
            # to reach this else clause. but added in case something has been overlooked
            print("error: this shouldnt happen --> check_get_params");
    # for debug purpose, check global var debug
    if debug: print("wrong values: ", wrong_input_values);
    if wrong_input_values:
        # if wrong_input_values != empty, then some inputs are wrongly written therefore, return
        # wrong inputs and internal error message for further processing
        return wrong_input_values, "input_error"

    # find the disjoint list -> defined_params are the supported parameters, params.keys() are the
    # actually inputted parameters. find the parameteres not defined in the input and set as default
    # value = "all"
    disjoint_list = list(set(defined_params) - set(params.keys()))
    if debug: print("default parameteres: ", disjoint_list);
    if disjoint_list:
        for default_params in disjoint_list:
            if(default_params == "methods" or default_params == "sort"):
                params[default_params] = "none"
            else:
                params[default_params] = "all"
    # everything checks out, therefore return the new parameter list with default values added and
    # internal message "ok" for further processing
    return params, "ok"

def build_payload(params, size=max_number_of_datapoints, page_start=pagination_start):
    time_interval = [None, None]
    longitude, latitude = [None, None],[None, None]

    if params["time"] == "all":
        # "all" = default value, therefore set time_interval[0](-lower_bound-) = 0, and
        # time_interval[0](-upper_bound-) = the current time
        # fyi, have to use the format specified by elastic search
        # example: 2019-09-14T12:11:10
        pythonic_date = str(datetime.datetime.now())
        time_interval[0] = 0
        time_interval[1] = (pythonic_date[0:10] + "T" + pythonic_date[11:19])

    else:
        # not default --> split on ",". because the format of input is equal to the elastic search
        # format, there is no need to fix the input.
        # example: 2012-05-14T12:11:10,2019-09-14T03:02:01
        time_interval = params["time"].split(",")

    if params["location"] == "all":
        # valid range of longitude is [-180, 180]
        # valid range of latitude is [-90, 90]
        # "all" == default value--> therefore set to max possible values
        # use valid range -1, because in the payload itself, a +-1 is added for a wider range of search
        # as specific points can be hard to specify
        # index[0] == lower_bound, index[1] == upper_bound
        longitude[0], longitude[1] = -90, 90
        latitude[0], latitude[1] = -180, 180
    else:
        # value is specified form input
        # example: "123.3,98.564" // "123.3,98.564,98.1,96.2"
        location_data = params["location"].split(",")
        if len(location_data) == 2:
            # This is a single point. Therefore add with epsilon, as hitting one spot exactly is quite hard
            # cast to float as the variables are used with epsilon
            epsilon = 0.0001
            latitude[0], latitude[1] = float(location_data[0]) - epsilon, float(location_data[0]) + epsilon
            longitude[0], longitude[1] = float(location_data[1]) - epsilon, float(location_data[1]) + epsilon
        elif len(location_data) == 3:
            # This is for a single point, with the third value specifying the epsilon
            epsilon = float(location_data[2])
            latitude[0], latitude[1] = float(location_data[0]) - epsilon, float(location_data[0]) + epsilon
            longitude[0], longitude[1] = float(location_data[1]) - epsilon, float(location_data[1]) + epsilon
        else:
            # this is a square. 2 points defining an effective area
            #print(location_data, "\n")
            latitude[0] = min(float(location_data[0]), float(location_data[2]))
            latitude[1] = max(float(location_data[0]), float(location_data[2]))
            longitude[0] = min(float(location_data[1]), float(location_data[3]))
            longitude[1] = max(float(location_data[1]), float(location_data[3]))

    # "gte" == greater than or equal, essentially -lower_bound-
    # "lte" == less thaan or equal, essentially -upper_bound-
    payload = {
        "query": {
            "size": size,
            "from": page_start,
            "query": {
                "bool": {
                     "filter": [
                        {
                            "range": {
                                "timestamp": {
                                    "gte": time_interval[0],
                                    "lte": time_interval[1]
                                }
                            }
                        },
                        {
                            "range":{
                                "state.latitude":{
                                    "gte": str(latitude[0]),
                                    "lte": str(latitude[1])
                                }
                            }
                        },
                        {
                            "range":{
                                "state.longitude":{
                                    "gte": str(longitude[0]),
                                    "lte": str(longitude[1])
                                }
                            }
                        }
                    ]
                }
            },
            "sort": [
                {"state.processed_timestamp": {"order": "asc", "mode":"avg"}}
            ]
        }
    }

    return payload

# fetch_data returns an array of dictionaries, so that each dictionary is guaranteed to fit in a single
# package. We do not need to pass down the number of pages, on a size to big, it will allways split in half
# @TODO Find some way of fetching more than 10000 data items. Range with gte and lte is the current lead
def fetch_data(payload, params, size=max_number_of_datapoints, page_start=0):
    headers = {
            "Authorization": vars.var_dict["token"],
            "identityId": vars.var_dict["identityId"],
            "x-api-key": vars.var_dict["api_key"]
            }

    request_params = {}
    request_response = requests.post(url=vars.var_dict["api_url"] + "/observations/find",
                                     data = json.dumps(payload), headers = headers,)
    request_object = json.loads(request_response.text)

    # The format to be sent is eihter a single data item on the form {data:[datapoint,datapoint,...]},
    # or muliple elements in a list of these
    data_list = []

    # Here we handle error cases. When requesting, the request can fail both because of
    # pagination error, or authentication error
    if "hits" not in request_object.keys():
        # On a pagination fault, the returned payload will have the field 'error' in the message
        if "message" in request_object.keys() and "Error" in request_object["message"].values():
            print("size + page is over 10000, presumabbly")
            return

        # The message 'errorMessage' only shows up on size error
        elif "errorMessage" in request_object.keys():
            print("The packet was too big! Current size is " + str(size)
                  + ", and pagination starts at " + str(page_start))

            # To fix, we split the current page size in half, and try to fetch each part by themselves
            lower_size = math.floor(size/2)
            upper_size = size-lower_size
            data_list.extend(
                fetch_data(build_payload(params, size=lower_size, page_start=page_start),params))

            data_list.extend(
                fetch_data(build_payload(params, size=upper_size, page_start=page_start+lower_size),params))

            return data_list

        elif "message" in request_object.keys():
            # In case of authentication failiure, we first want to try and refresh the token
            vars.reauthent()
            headers = {
                "Authorization": vars.var_dict["token"],
                "identityId": vars.var_dict["identityId"],
                "x-api-key": vars.var_dict["api_key"]

            }
            request_response = requests.post(url=vars.var_dict["api_url"] + "/observations/find",
                                             data = json.dumps(payload), headers = headers)
            request_object = json.loads(request_response.text)

            if "message" in request_object.keys():
                # We need to fully reauthenticate
                vars.getAuthent()
                headers = {
                    "Authorization": vars.var_dict["token"],
                    "identityId": vars.var_dict["identityId"],
                    "x-api-key": vars.var_dict["api_key"]
                }
                request_response = requests.post(url=vars.var_dict["api_url"] + "/observations/find",
                                                 data = json.dumps(payload), headers = headers)
                request_object = json.loads(request_response.text)

    # if we got here, it means the packet size was small enough. Only 1 data object is added
    pruned_data_object = {"data":[]}
    #print(request_object)
    # if request_object return NULL then reauthenticate
    # TODO this if should be generalised to not look for co2 ppm only, but rather the requested pollutants
    for measurement in request_object["hits"]["hits"]:
        # ["hits"]["hits"] because that is the format we get back from MIC
        if("latlng" in measurement["_source"]["state"] and
           "co2_ppm" in measurement["_source"]["state"]):
            # if latlng ie latitude-longitude does not exist then data is of no use, same applies
            # to co2_ppm
            point_data = {}
            # append thingName, essentially ID of sensor

            point_data["thingName"] = measurement["_source"]["thingName"]
            point_data["timestamp"] = str(measurement["_source"]["state"]["processed_timestamp"])

            # sometimes the format gives back a string and sometimes a list, have to check it
            if (type(measurement["_source"]["state"]["latlng"]) == list):
                latitude, longitude = measurement["_source"]["state"]["latlng"]
                point_data["longitude"] = str(longitude)
                point_data["latitude"] = str(latitude)
            elif(type(measurement["_source"]["state"]["latlng"]) == str):
                latitude, longitude = measurement["_source"]["state"]["latlng"].split(",")
                point_data["longitude"] = longitude.strip(" ")
                point_data["latitude"] = latitude.strip(" ")
            else:
                # hopefully never get here,else means that once again a new format.
                print("response has weird latlng format. FAILED")
                return None

            pruned_dict = {}
            if params["pollutants"] == "all":
                params["pollutants"] = ",".join([str(x) for x in range(len(vars.var_dict["pollutants"]))])
            for i in params["pollutants"].split(","):
                point_data[vars.var_dict["pollutants"][int(i) - 1]] = str(measurement["_source"]["state"][vars.var_dict["pollutants"][int(i) - 1]])

            pruned_data_object["data"].append(point_data)

    # return the list of data objects collected
    data_list.append(pruned_data_object)
    print("The list resturned has " + str(len(data_list[0]["data"])) + " elements")
    return data_list


api.add_resource(fetch, '/fetch')
api.add_resource(help_manual, '/help')
if __name__ == '__main__':
    vars = variables()
    app.run(debug=True)
