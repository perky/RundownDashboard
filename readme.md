# Rundown Dashboard
A little thing I made while at Kendal Calling festival for showing a rundown of which bands
are due to go on stage (to help the film crew keep on schedule).

It shows a big digital clock, which band is currently live and how long they'e been playing for,
which band is up next and how many minutes until they are on, then along the bottom it shows all bands for the day in
a timeline view.

At the moment you simply define the schedule in a json file (schedule.json) but I would like to sync this up to
google spreadsheets one day.

To run you just need to serve it up as a static http server. If you're on a mac just go to this directory in terminal
and run `http-server` and then browse to `localhost:8080`.