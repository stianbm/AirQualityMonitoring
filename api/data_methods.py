# This file contains methods for data treatment
import math

# Subdivide points from a given area into grid cells. For each cell, pick a representative.
# Average out the pollution values in every grid cell, and place the final value at the location of the
# representative. Do this for every cell, and return a python dict in the ususal format.
# A dictionary of pollutants to use must also be included, to tell the algorithm which ones to average
def average_data_points_grid(data, cell_width, cell_height, x, y, area_height, area_width, pollutants):
    print("The function \"average_data_points_grid\" is called")
    # We round up, the rightmost and lowe cells will most likely be smaller than the rest
    num_cells_x = math.ceil(area_width/cell_width)
    num_cells_y = math.ceil(area_height/cell_height)
    grid_length = num_cells_x * num_cells_y

    # We need a list to hold the averages while we work
    # An observation: the sensors are mainly placed along roads. Many cells will therfore be empty
    # This means that a dictionary that only stores "found" cells most likely will be more effective
    # (x, y) => datapoint
    current_cell_averages = {}

    print("Averaging with respect to the pollutants " + str(pollutants))

    # When updating the averages, remember that a given datapoint might not have data for all polutants

    # The data can be made up of several lists

    print("data, in its original form: " + str(data))

    result_data_list = []
    for list in data:
        data_list = list["data"] # The data is wrapped in a dict
        print("First batch of data " + str(data_list))

        # We must maintain a list items to delete (with indeces of the items)
        items_to_delete = []
        for i in range (len(data_list)):
            # First, we need to find the relevant grid cell
            cell_x = math.floor(float(data_list[i]["latitude"])/cell_width)
            cell_y = math.floor(float(data_list[i]["longitude"])/cell_height)

            # this point is the first found in a cell, it is promoted to representative
            if (cell_x, cell_y) not in current_cell_averages:
                print("found new representative for " + str(cell_x) + "," + str(cell_y) +
                      ", it is " + str(data_list[i]))
                current_cell_averages[(cell_x, cell_y)] = data_list[i]

            # We allready have a representative, add the requested pollutants to its sum
            # and discard the found data point
            else:
                for pollutant in pollutants:
                    # This is a json file, and everything is strings.
                    # Need to do some converting back and forth
                    current_pol_value = float(current_cell_averages[(cell_x, cell_y)][pollutant])
                    current_pol_value += float(data_list[i][pollutant])
                    current_pol_value /= 2

                    current_cell_averages[(cell_x, cell_y)][pollutant] = str(current_pol_value)

                # Now that we are done, we delete the data point
                items_to_delete.append(i)

        print("data list before " + str(len(data_list)))
        # For each data list, we need to round up the items slated for deletion.
        # We do this by copying only the representatives into a new data structure we return

        result = {"data":[]}
        for i in range(len(data_list)):
            if(i not in items_to_delete):
                result["data"].append(data_list[i])

        print("data list after " + str(result))
        result_data_list.append(result)

    return result_data_list
