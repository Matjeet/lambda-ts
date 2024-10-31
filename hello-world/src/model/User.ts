export interface User {
  id: number,
  name: string,
  last_name: string,
  birth_date: Date,
  email: string,
  password: string,
  photo?: string
}