### STAGE 1:BUILD ###
# Defining a node image to be used as giving it an alias of "build"
# Which version of Node image to use depends on project dependencies 
# This is needed to build and compile our code 
# while generating the docker image
FROM node:16-alpine AS build

ENV ENVIRONMENT="prod"

# Create a Virtual directory inside the docker image
WORKDIR /usr/src/app
# Copy files to virtual directory
# COPY package.json package-lock.json ./
COPY package.json package-lock.json ./
RUN npm i npm@latest -g
# Run command in Virtual directory
RUN npm cache clean --force

#RUN npm i npm@latest -g

# Copy files from local machine to virtual directory in docker image
COPY . .
RUN npm install
RUN npm run build --prod --base-href

### STAGE 2:RUN ###
# Defining nginx image to be used
FROM nginx:latest
# Copying compiled code and nginx config to different folder
# NOTE: This path may change according to your project's output folder 

#COPY --from=build /app/dist /usr/share/nginx/html
#COPY ./nginx-custom.conf /etc/nginx/conf.d/default.conf

COPY nginx-custom.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/src/app/dist/verificador-facial /usr/share/nginx/html

# Exposing a port, here it means that inside the container 
# the app will be using Port 80 while running
EXPOSE 4200