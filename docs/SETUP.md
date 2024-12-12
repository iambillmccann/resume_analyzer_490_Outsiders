# Running the project locally

In order to run the project, you first must have docker installed on your machine

Next, ensure the docker application is running

Navigate to the root directory of the project and run 'docker-compose up --build' if first time or 'docker-compose up' if running again

Please note: If you get a package not found issue in the frontend, try doing npm install inside the frontend folder to get all dependencies. Then rerun the docker build command.

This command will build the docker containers as well as any needed dependencies for the project as specified in requirements.txt

Once the build finishes it will be running automatically

Use ^C to stop the application running
