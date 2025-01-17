import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { Metrics } from '@aws-lambda-powertools/metrics';
import { Logger } from '@aws-lambda-powertools/logger';
import { Tracer } from '@aws-lambda-powertools/tracer';
import { saveUser } from './src/service/userService';
import { registerUserDto } from './src/dto/request/registerUser';
import { genericResponse } from './src/dto/response/genericResponse';
const metrics = new Metrics();
const logger = new Logger();
const tracer = new Tracer();

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {APIGatewayProxyEvent} event - API Gateway Lambda Proxy Input Format
 * @param {Context} object - API Gateway Lambda $context variable
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {APIGatewayProxyResult} object - API Gateway Lambda Proxy Output Format
 *
**/

export const handler = async(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    logger.info('CONTROLLER: Starting the process to create a user');

    if(!event.body){
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Se requiere un body en la petición"
            })
        }
    }

    const userInfo: registerUserDto = JSON.parse(event.body);

    logger.info('CONTROLLER: Invoking the service method');

    const response = await saveUser(userInfo);

    logger.info('CONTROLLER: Process of creating a user completed');

    return {
        statusCode: response.statusCode,
        body: JSON.stringify({
            message: response.message
        })
    };
}

// export const lambdaHandler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
//     let response: APIGatewayProxyResult;

//     // Log the incoming event
//     logger.info('Lambda invocation event', { event });

//     // Append awsRequestId to each log statement
//     logger.appendKeys({
//         awsRequestId: context.awsRequestId,
//     });
//     // Get facade segment created by AWS Lambda
//     const segment = tracer.getSegment();

//     if (!segment) {
//         response = {
//             statusCode: 500,
//             body: 'Failed to get segment',
//         };
//         return response;
//     }

//     // Create subsegment for the function & set it as active
//     const handlerSegment = segment.addNewSubsegment(`## ${process.env._HANDLER}`);
//     tracer.setSegment(handlerSegment);

//     // Annotate the subsegment with the cold start & serviceName
//     tracer.annotateColdStart();
//     tracer.addServiceNameAnnotation();

//     // Add annotation for the awsRequestId
//     tracer.putAnnotation('awsRequestId', context.awsRequestId);
//     // Capture cold start metrics
//     metrics.captureColdStartMetric();
//     // Create another subsegment & set it as active
//     const subsegment = handlerSegment.addNewSubsegment('### MySubSegment');
//     tracer.setSegment(subsegment);

//     try {
//         // hello world code
//         response = {
//             statusCode: 200,
//             body: JSON.stringify({
//                 message: 'hello world',
//             }),
//         };
//         logger.info(`Successful response from API enpoint: ${event.path}`, response.body);
//     } catch (err) {
//         // Error handling
//         response = {
//             statusCode: 500,
//             body: JSON.stringify({
//                 message: 'some error happened',
//             }),
//         };
//         tracer.addErrorAsMetadata(err as Error);
//         logger.error(`Error response from API enpoint: ${err}`, response.body);
//     } finally {
//         // Close subsegments (the AWS Lambda one is closed automatically)
//         subsegment.close(); // (### MySubSegment)
//         handlerSegment.close(); // (## index.handler)

//         // Set the facade segment as active again (the one created by AWS Lambda)
//         tracer.setSegment(segment);
//         // Publish all stored metrics
//         metrics.publishStoredMetrics();
//     }

//     return response;
// };
