import { Logger } from "@aws-lambda-powertools/logger"
import { registerUserDto } from "../dto/request/registerUser"
import { genericResponse } from "../dto/response/genericResponse"
import { getUserByEmail } from "../repository/UserRepository";
import { User } from "../model/User";
import bcrypt from "bcrypt";

const logger = new Logger();

export const saveUser = async(userInfo: registerUserDto): Promise<genericResponse> => {
  logger.info('SERVICE: Strating saveUser method');

  const response: genericResponse = {statusCode: 200, message: ""};

  if(!isValidRequest(userInfo)){
    response.statusCode = 400;
    response.message = "Se tiene un error en cuerpo de la solicitud. Posible error en los tipos o datos requeridos faltantes";
    return response;
  }

  if(calculateAge(new Date(userInfo.birth_date)) < 18){
    response.statusCode = 400;
    response.message = "El usuario no es mayor de edad";
    return response;
  }

  if(!isValidEmail(userInfo.email)){
    response.statusCode = 400;
    response.message = "El correo no tiene la sintaxis adecuada";
    return response;
  }

  const user: User | null = await getUserByEmail(userInfo.email);

  if(user !== null){
    response.statusCode = 400;
    response.message = `Ya existe un usuario registrado con el email ${userInfo.email} dentro de la base de datos`;
    return response;
  }

  userInfo.password = await hasPassword(userInfo.password);

  if(!saveUser(userInfo)){
    response.statusCode = 500;
    response.message = "Sucedió un error almacenando el usuario";
    return response;
  }

  response.message = "Creación de usuario exitosa"

  return response;

}

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
  return emailRegex.test(email);
}

const isValidRequest = (request: any): request is registerUserDto => {
  return typeof request.name === 'string' &&
         typeof request.last_name === 'string' &&
         typeof request.birth_date === 'string' &&
         typeof request.email === 'string' &&
         typeof request.password === 'string' &&
         (typeof request.photo === 'string' || request.photo === undefined)
}

const calculateAge  = (userBirthDate: Date): number => {
  
  const today: Date = new Date();

  let age = today.getFullYear() - userBirthDate.getFullYear();
  const monthDifference = today.getMonth() - userBirthDate.getMonth();
  const dayDifference = today.getDate() - userBirthDate.getDate();

  if(monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)){
    age--;
  }

  return age;
}

const hasPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}