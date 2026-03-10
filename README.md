# localhunt

***************VIEW THIS FILE IN CODE FORMAT FOR CLEAR UNDERSTANDING***************

create a web project at firebase, build authentication, firestore database (in test mode, not in production).
get the credentials and service-account file that are to be setup in .env file
create an account in mapbox and get an api token,
create an account in cloudinary and get token.

add the service account file at location:---  src/config/  , add the .json access file from firebase.

.env file structure
backend:---
PORT=5000
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./src/config/filename.json  (replace with actual file name)
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=

# Mapbox Private API Token (will be used for server-side geocoding/directions if needed)
MAPBOX_PRIVATE_TOKEN=

# Mapbox Public API Token (will be used for client-side map display)
MAPBOX_PUBLIC_TOKEN=

# Cloudinary Credentials (from your Cloudinary Dashboard)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

frontend:---
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_MAPBOX_PUBLIC_TOKEN=
VITE_BACKEND_API_URL="http://localhost:5000/api"

after properly updating the details in the .env file,
install the dependencies as listed in the package.json file, just by executing the command "npm i" in both frontend and backend directories

then comes the important part,
when you try to run project, errors pileup asking to build the indexes in firestore, build all of them(usually takes much time)
be patient, build all of them(currently there are 38) , may increase in future 

start commands:
frontend:---
npm run dev
backend:---
npm start (or) node server.js

Working URL : https://nearme-iota.vercel.app/
