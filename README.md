# Identity Resolution App 

As a part of Bitespeed assignment this backend app gives us the functionality to identify the persons who are using different email address or phone numbers to order from Fluxkart.
The major tech stack used to build this app is: NodeJS, ExpressJS, PostgreSQL

Deployed link: https://identity-resolution-app.onrender.com/identify

## Procedure to run the app

1. Copy the deployed link to POSTMAN
2. Open a new POST request in POSTMAN and paste the link
3. We have the following database in use you can use it:
![image](https://github.com/user-attachments/assets/93e89800-7838-4a76-881a-b10f7af24ae6)
4. Give the input as raw Body in JSON format for example:
    {
       "email": "lorraine@hillvalley.edu"
       "phoneNumber": "121212"
    }

