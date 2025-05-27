# Identity Resolution App 

As a part of Bitespeed assignment this backend app gives us the functionality to identify the persons who are using different email address or phone numbers to order from Fluxkart.
The major tech stack used to build this app is: NodeJS, ExpressJS, PostgreSQL

## Procedure to run the app

1. Download the zip file
2. Install the dependencies
3. Connect to PostgreSQL in your device
4. Create the table by the given SQL query:
CREATE TABLE IF NOT EXISTS public.contact
(
    id integer NOT NULL DEFAULT nextval('"Contact_id_seq"'::regclass),
    phonenumber character varying COLLATE pg_catalog."default",
    email character varying COLLATE pg_catalog."default",
    linkedid integer,
    linkprecedence character varying COLLATE pg_catalog."default" NOT NULL,
    createdat timestamp with time zone DEFAULT now(),
    updatedat timestamp with time zone DEFAULT now(),
    deletedat timestamp with time zone,
    CONSTRAINT "Contact_pkey" PRIMARY KEY (id),
    CONSTRAINT "fk_linkedId" FOREIGN KEY (linkedid)
        REFERENCES public.contact (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)
OR using pgadmin create table by ensuring these values
![image](https://github.com/user-attachments/assets/961d6d70-0791-4b7a-822a-e587e0d8354a) make a foreign key fk_linkedid referenced to id and referencing table contact table
5. Give some data input like this
INSERT INTO contact (phonenumber, email, linkedid, linkprecedence, createdat, updatedat, deletedat)
VALUES 
('123456', 'lorraine@hillvalley.edu', NULL, 'primary', NOW(), NOW(), NULL),
('123456', 'mcfly@hillvalley.edu', NULL, 'primary', NOW(), NOW(), NULL),
('919191', 'george@hillvalley.edu', NULL, 'primary', NOW(), NOW(), NULL),
('717171', 'george@hillvalley.edu', 3, 'secondary', NOW(), NOW(), NULL);

6. After this, run the program.
7. Use http://localhost:3000/identify in postman
8. Give the appropriate inputs to see the results
