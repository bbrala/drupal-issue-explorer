The Drupal Issue Explorer is a tool that allows visualization and exploration of Drupal.org issues and their relationships using a graph database.

![screenshot](assets/screenshot.png)

# Getting started

Getting started is quite easy using ddev.

1. Clone the project
2. Make sure you have `git lfs` installed and run `git lfs install`.
3. Run `git lfs pull` to download the cache. This will take a while, but it is much faster than downloading the whole project.
4. Run `ddev start` in the project root
5. Run `ddev launch` to open the project in your browser

This will launch the project with a prepopulated Neo4j database and launch the webserver. The data is updated once a week, if you want to update the data.

1. Stop your project `ddev stop`
2. Pull all the changes `git pull`
3. Start your project `ddev start`
4. Run `ddev launch` to open the project in your browser
