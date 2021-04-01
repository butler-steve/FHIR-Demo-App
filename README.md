# FHIR API Demo App

A simple app to accomplish the following:
1.  Create a simple web application
1.  Build out methods to fetch a sample of patients from the FHIR sandbox server at  [http://hapi.fhir.org/](http://hapi.fhir.org/),
1.  Create views (Html) that will show basic statistics from the data you retrieved including:
--   Number of patients
--   Average age
--   Number of pediatric patients (less than 18)
1.  Create a simple visualization to graph the age of patients as a histogram using ChartJS
1.  Create a simple table to lists out all patients in the retrieved dataset with a simple filter for this table to show only pediatric cases (patients less than age 18).

## Installation Details

* Ruby version
`ruby 3.0.0p0 (2020-12-25 revision 95aff21468) [x86_64-linux]`

* Deployment instructions
`bundle install`
`yarn install`
`rails s`
* In a browser, navigate to `http://localhost:3000`
