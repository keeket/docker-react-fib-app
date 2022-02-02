FROM node:16-alpine as builder

WORKDIR '/app'

COPY package.json .
RUN npm install
COPY . .
RUN ["npm", "run", "build"]

FROM nginx

# poort instructie voor aws
EXPOSE 3000

# overschrijf nginx configuratie en zet gebouwde app in image
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html