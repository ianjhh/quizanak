#base image
FROM node:23-alpine3.19

#directory whre we are going to copy file
WORKDIR /root/quizanak

#copy file to container
COPY . .

#install dependencies for web app to be dockzerized
COPY package.json ./
COPY package-lock.json ./
RUN npm install

#expose port
EXPOSE 5000

#CMD specifies which command to run when container is run, in this case npm start
CMD ["npm", "start"]

