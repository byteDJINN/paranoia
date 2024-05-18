FROM debian
COPY . .
RUN apt update
RUN apt -y install nodejs npm
RUN npm install
RUN npm run build
CMD ["node", "build"]
