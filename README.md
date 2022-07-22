# ChatApp
### Introduction
The MERN stack which consists of Mongo DB, Express.js, Node.js, and React.js is a popular stack for building full-stack web-based applications because of its simplicity and ease of use. In recent years, with the explosive popularity and the growing maturity of the JavaScript ecosystem, the MERN stack has been the goto stack for a large number of web applications. This stack is also highly popular among newcomers to the JS field because of how easy it is to get started with this stack.

This repo consists of a Chat Application built with the MERN stack. We have built this sometime back when we just learnt the stack and we have left it here for anyone new to the stack so that they can use this repo as a guide.

This is a full-stack chat application that can be up and running with just a few steps. Its frontend is built with Chakra UI running on top of React. The backend is built with Express.js and Node.js. Real-time message broadcasting is developed using Socket.IO. <br/>

### How to use:
1. Clone the repository.
2. Once you have the repo, you need to install its dependencies. So using a terminal, move into the root directory of the project and execute ```npm i``` to install the    dependencies of the Node.js server
3. Go to the frontend directory and run the ```npm i``` command to install all node modules required for frontend.
4. Create one file in frontend and main directory name as .env and assign all the values to variables.
5. Create two terminals.On one terminal go to frontend directory and run command ```npm start``` to start the frontend and on other terminal go to backend directory and run command ```nodemon server.js``` to run the backend of the project.

### Technologies Used:
1.	We have a MERN architecture for developing a website.
2.	MongoDB is used as a cloud database for the website.
3.	App level state management is done by making use of redux which reduces complexity of state management.
4.	Cloudinary is used for storing the images. Eg: When image is uploaded by a user as a profile picture or storing food product images etc.
5.	For authentication, we have made use of jwt tokens which expire after a certain time.
6.	We have used send grid api for sending mail to the user.
