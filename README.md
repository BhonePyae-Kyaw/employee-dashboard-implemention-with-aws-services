# Employee Dashboard Implementation Using AWS Services

This project implements an Employee Dashboard leveraging various AWS services for a fully serverless and scalable architecture.

## Application Architecture

### Frontend

- **Framework:** React.js with Vite for fast development and optimized builds.
- **Hosting:** The static site is deployed on an Amazon S3 bucket.
- **Access URL:** [http://employee-dashboard-app-s3bucket.s3-website-us-east-1.amazonaws.com/](http://employee-dashboard-app-s3bucket.s3-website-us-east-1.amazonaws.com/)

### Backend & Data Layer

- **Database:** Amazon RDS running MySQL serves as the primary data store.
- **Serverless Functions:** AWS Lambda functions handle data manipulation, interacting with the MySQL database.
- **API Management:** Amazon API Gateway provides a RESTful API interface for the frontend to securely communicate with the Lambda functions.

## Interaction Flow

1. **User Request:** The frontend (hosted on S3) sends requests via the API Gateway.
2. **API Processing:** Amazon API Gateway routes the requests to the appropriate AWS Lambda function.
3. **Data Operations:** The Lambda function interacts with the MySQL database on Amazon RDS to perform CRUD operations.
4. **Response:** Results are returned through the API Gateway back to the frontend, updating the dashboard accordingly.

## Documentation & Implementation Details

- **Implementation Diagram:**  
  An architecture diagram illustrating the components and data flow is included in the project.
  
- **Step-by-Step Documentation:**  
  A detailed documentation of the process, including errors encountered, lessons learned, and troubleshooting steps, is available on [Excalidraw](https://excalidraw.com/#json=G2Ui8JUMJXeXy6X10nOw8,OkT6xYOuzXdpsDIGDwyXBw). 

## Contributing & Support

If you find this project useful, please consider starring the repository. Contributions, feedback, and improvements are always welcome!
