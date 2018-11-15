# CO2Armadillo

Source code for Telenor for the course tdt4290 Customer-driven Project
The product offers a dashboard for visual representation and a REST API to access data gathered by mobile air quality sensors in Trondheim municipality. Currently the dashboard is deployed for Tromsø, not Trondheim.

To run the dashboard locally:

- cd into dashbord and run `npm i`
- cd into api and run `python api_server.py`(make sure to have flask installed `pip install flask`)
- in a different console, cd into dashboard and run `npm start`
- sit back and enjoy

To run tests:

- cd into dashboard and run 'npm i'.
- run 'npm test'.
