import { Logger } from "@aws-lambda-powertools/logger";
import { pool } from "../config/database"
import { User } from "../model/User";
import { registerUserDto } from "../dto/request/registerUser";

const logger = new Logger();

export const getUserByEmail = async (email: String): Promise <User | null> => {
  logger.info("REPOSITORY: Getting user by email")

  let response: User | null = null;
  
  const conection = await pool.connect();
  
  try{
    const result = await conection.query(
      'SELECT * FROM public.users u WHERE u.email = $1',
      [email]
    )

    if(!result.rows[0]){
      return response;
    }

    response = result.rows[0];  

    return response;
  }
  catch (e){
    console.log(e)
    return response;
  }
}

export const saveUser = async (userInfo :registerUserDto): Promise<boolean> => { 
  logger.info("REPOSITORY: Saving user")
  
  const conection = await pool.connect();

  try {
    await conection.query(
      'INSERT INTO public.users (name, last_name, birth_date, email, password, photo) VALUES ($1,$2,$3,$4,$5,$6)',
      [ userInfo.name,
        userInfo.last_name,
        userInfo.birth_date,
        userInfo.email,
        userInfo.password,
        userInfo.photo
      ]
    );

    return true;
  }
  catch(e){
    console.log(e);

    return false;
  }
  
}